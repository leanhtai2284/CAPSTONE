import Pantry from "../models/Pantry.js";
import Notification from "../models/Notification.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const VIETNAM_TZ = "Asia/Ho_Chi_Minh";
const DEFAULT_EXPIRING_DAYS = 3;
const MIN_EXPIRING_DAYS = 1;
const MAX_EXPIRING_DAYS = 30;

let schedulerInterval = null;
let lastRunVietnamDayIndex = null;
let runningGlobalJob = false;

function toBoolean(value, fallback = false) {
  if (value == null) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function clampExpiringDays(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_EXPIRING_DAYS;
  return Math.min(MAX_EXPIRING_DAYS, Math.max(MIN_EXPIRING_DAYS, parsed));
}

function clampVietnamHour(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 7;
  return Math.min(23, Math.max(0, parsed));
}

function getVietnamDayIndex(dateInput = new Date()) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return Math.floor((date.getTime() + VN_OFFSET_MS) / MS_PER_DAY);
}

function getUtcStartFromVietnamDayIndex(dayIndex) {
  return new Date(dayIndex * MS_PER_DAY - VN_OFFSET_MS);
}

function createEventKey(itemId, status, expiryVietnamDayIndex) {
  return `pantry:${itemId}:${status}:${expiryVietnamDayIndex}`;
}

function buildPayload({ item, status, daysToExpire, expiryVietnamDayIndex, expiringDays }) {
  const title = status === "expired" ? "Thực phẩm đã hết hạn" : "Thực phẩm sắp hết hạn";
  const message =
    status === "expired"
      ? `${item.name} đã hết hạn. Nên kiểm tra trước khi sử dụng.`
      : `${item.name} sẽ hết hạn sau ${daysToExpire} ngày.`;

  return {
    user: item.user,
    audience: "user",
    title,
    message,
    type: "pantry",
    metadata: {
      source: "pantry",
      pantryItemId: item._id,
      status,
      daysToExpire,
      expiryDate: item.expiryDate,
      expiryVietnamDayIndex,
      expiringDays,
      timezone: VIETNAM_TZ,
      eventKey: createEventKey(item._id, status, expiryVietnamDayIndex),
    },
    read: false,
  };
}

async function insertNotificationsIfNotExists(candidates, userId) {
  if (candidates.length === 0) {
    return { created: 0, skippedExisting: 0, failedToCreate: 0 };
  }

  const eventKeys = candidates.map((candidate) => candidate.metadata.eventKey);
  const existingFilter = { "metadata.eventKey": { $in: eventKeys } };
  if (userId) {
    existingFilter.user = userId;
  }

  const existing = await Notification.find(existingFilter)
    .select("metadata.eventKey")
    .lean();

  const existingEventKeys = new Set(
    existing.map((item) => item?.metadata?.eventKey).filter(Boolean)
  );

  const docsToInsert = candidates.filter(
    (candidate) => !existingEventKeys.has(candidate.metadata.eventKey)
  );

  let created = 0;
  let failedToCreate = 0;

  if (docsToInsert.length > 0) {
    const { createNotification } = await import(
      "../controllers/notificationController.js"
    );

    const createdResults = await Promise.allSettled(
      docsToInsert.map((doc) => createNotification(doc))
    );

    for (const result of createdResults) {
      if (result.status === "fulfilled" && result.value) {
        created += 1;
      } else {
        failedToCreate += 1;
      }
    }
  }

  return {
    created,
    skippedExisting: candidates.length - docsToInsert.length,
    failedToCreate,
  };
}

export async function runPantryExpiryNotificationJob({
  expiringDays,
  userId,
  trigger = "manual",
} = {}) {
  if (!userId && runningGlobalJob) {
    return {
      skipped: true,
      reason: "global_job_is_running",
      trigger,
      timezone: VIETNAM_TZ,
    };
  }

  const finalExpiringDays = clampExpiringDays(
    expiringDays ?? process.env.PANTRY_EXPIRING_DAYS
  );
  const now = new Date();
  const todayVietnamDayIndex = getVietnamDayIndex(now);
  const startAfterExpiringUtc = getUtcStartFromVietnamDayIndex(
    todayVietnamDayIndex + finalExpiringDays + 1
  );

  const filter = {
    expiryDate: { $lt: startAfterExpiringUtc },
  };

  if (userId) {
    filter.user = userId;
  }

  if (!userId) {
    runningGlobalJob = true;
  }

  try {
    const pantryItems = await Pantry.find(filter)
      .select("_id user name expiryDate")
      .lean();

    const notificationCandidates = [];
    let expiredCandidates = 0;
    let expiringCandidates = 0;

    for (const item of pantryItems) {
      const expiryVietnamDayIndex = getVietnamDayIndex(item.expiryDate);
      const daysToExpire = expiryVietnamDayIndex - todayVietnamDayIndex;

      if (daysToExpire < 0) {
        expiredCandidates += 1;
        notificationCandidates.push(
          buildPayload({
            item,
            status: "expired",
            daysToExpire,
            expiryVietnamDayIndex,
            expiringDays: finalExpiringDays,
          })
        );
        continue;
      }

      if (daysToExpire <= finalExpiringDays) {
        expiringCandidates += 1;
        notificationCandidates.push(
          buildPayload({
            item,
            status: "expiring",
            daysToExpire,
            expiryVietnamDayIndex,
            expiringDays: finalExpiringDays,
          })
        );
      }
    }

    const { created, skippedExisting, failedToCreate } =
      await insertNotificationsIfNotExists(notificationCandidates, userId);

    return {
      success: true,
      trigger,
      timezone: VIETNAM_TZ,
      expiringDays: finalExpiringDays,
      scannedItems: pantryItems.length,
      candidateNotifications: notificationCandidates.length,
      expiredCandidates,
      expiringCandidates,
      created,
      skippedExisting,
      failedToCreate,
      userScope: userId ? "single_user" : "all_users",
      runAt: now.toISOString(),
    };
  } finally {
    if (!userId) {
      runningGlobalJob = false;
    }
  }
}

function isInScheduledWindow(now, runHourVietnam) {
  const nowVietnam = new Date(now.getTime() + VN_OFFSET_MS);
  const hour = nowVietnam.getUTCHours();
  const minute = nowVietnam.getUTCMinutes();
  return hour === runHourVietnam && minute < 5;
}

export function startPantryExpiryNotificationScheduler() {
  if (schedulerInterval) {
    return;
  }

  const enabled = toBoolean(process.env.PANTRY_NOTIFICATION_SCHEDULER, true);
  if (!enabled) {
    console.log("[PantryNotification] Scheduler disabled by env");
    return;
  }

  const runHourVietnam = clampVietnamHour(
    process.env.PANTRY_NOTIFICATION_RUN_HOUR_VN
  );

  const tick = async () => {
    const now = new Date();
    const todayVietnamDayIndex = getVietnamDayIndex(now);

    if (!isInScheduledWindow(now, runHourVietnam)) {
      return;
    }

    if (lastRunVietnamDayIndex === todayVietnamDayIndex) {
      return;
    }

    const result = await runPantryExpiryNotificationJob({ trigger: "scheduler" });
    lastRunVietnamDayIndex = todayVietnamDayIndex;

    console.log(
      `[PantryNotification] Scheduler run completed: created=${result.created}, scanned=${result.scannedItems}`
    );
  };

  schedulerInterval = setInterval(() => {
    tick().catch((error) => {
      console.error("[PantryNotification] Scheduler run failed", error);
    });
  }, 5 * 60 * 1000);

  const runOnStartup = toBoolean(
    process.env.PANTRY_NOTIFICATION_RUN_ON_STARTUP,
    false
  );

  if (runOnStartup) {
    runPantryExpiryNotificationJob({ trigger: "startup" })
      .then((result) => {
        console.log(
          `[PantryNotification] Startup run completed: created=${result.created}, scanned=${result.scannedItems}`
        );
      })
      .catch((error) => {
        console.error("[PantryNotification] Startup run failed", error);
      });
  }

  console.log(
    `[PantryNotification] Scheduler started. Run window: ${runHourVietnam}:00-${runHourVietnam}:04 (${VIETNAM_TZ})`
  );
}

export function stopPantryExpiryNotificationScheduler() {
  if (!schedulerInterval) {
    return;
  }

  clearInterval(schedulerInterval);
  schedulerInterval = null;
}
