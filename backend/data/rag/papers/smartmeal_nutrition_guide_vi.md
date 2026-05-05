# 📚 Cẩm Nang Dinh Dưỡng SmartMeal Tự Động (Vietnamese Nutrition Guide)

Tài liệu này cung cấp các kiến thức cơ bản và chuyên sâu về dinh dưỡng, lượng calo của các thực phẩm phổ biến tại Việt Nam, hướng dẫn cho các chế độ ăn, và lời khuyên y tế cơ bản. Bot AI RAG của SmartMeal sẽ sử dụng kiến thức này để tư vấn cho người dùng một cách chính xác, thân thiện và tuân thủ nguyên tắc khoa học.

---

## 1. Mẹo Tăng Cơ & Giảm Mỡ Cơ Bản

### Nguyên tắc giảm cân (Giảm mỡ)
- **Thâm hụt calo (Caloric Deficit):** Là nguyên tắc cốt lõi không thể thay thế. Cần ăn ít calo hơn lượng tiêu hao (TDEE). Mức thâm hụt an toàn là 300 - 500 kcal/ngày, giúp giảm 0.5kg/tuần.
- **Tăng cường Protein:** Giúp giữ cơ bắp (ngăn ngừa teo cơ) trong quá trình giảm mỡ và tạo cảm giác no lâu, tăng hiệu ứng nhiệt của thực phẩm (TEF).
- **Chất xơ & Nước:** Ăn nhiều rau xanh, trái cây ít ngọt và uống đủ 2-3 lít nước mỗi ngày giúp tăng cường trao đổi chất.
- **Hạn chế:** Đường tinh luyện (trà sữa, bánh ngọt), mỡ động vật bão hòa (thịt mỡ, da heo), đồ chiên ngập dầu.

### Nguyên tắc tăng cân (Tăng cơ)
- **Dư thừa calo (Caloric Surplus):** Ăn nhiều hơn mức TDEE khoảng 300 - 500 kcal/ngày. Nếu dư quá nhiều sẽ chuyển thành mỡ thừa thay vì cơ.
- **Nạp đủ Protein:** Để xây dựng cơ bắp, cần khoảng 1.6g - 2.2g protein / kg trọng lượng cơ thể.
- **Tinh bột (Carb) dồi dào:** Tinh bột là nguồn năng lượng chính để tập tạ. Nên ưu tiên Carb phức tạp như cơm lứt, yến mạch, khoai lang gai, bánh mì đen.
- **Ăn thành nhiều bữa:** 3 bữa chính và 2-3 bữa phụ (sữa tươi, các loại hạt, sinh tố bơ, chuối).

---

## 2. Thông tin Calo & Dinh dưỡng Thực phẩm Việt Nam phổ biến
*(Định lượng tham khảo cho 100g phần ăn được, chỉ số có thể thay đổi nhẹ tùy cách chế biến)*

### Nguồn Protein (Đạm)
- **Ức gà (luộc/hấp):** 165 kcal | 31g Protein | 0g Carb | 3.6g Fat
- **Thịt bò (thăn, nạc):** 250 kcal | 26g Protein | 0g Carb | 15g Fat (Chứa nhiều Kẽm và Sắt)
- **Thịt heo (nạc dăm):** 240 kcal | 19g Protein | 0g Carb | 14g Fat
- **Trứng gà (1 quả to ~50g):** 70 kcal | 6g Protein | 0g Carb | 5g Fat (Lòng đỏ chứa nhiều Vitamin D và Choline)
- **Tôm sú (luộc):** 99 kcal | 24g Protein | 0.2g Carb | 0.3g Fat (Ít calo, nhiều canxi)
- **Cá diêu hồng (hấp):** 128 kcal | 26g Protein | 0g Carb | 2.6g Fat
- **Đậu phụ non:** 60-70 kcal | 7g Protein | 1.5g Carb | 4g Fat (Tuyệt vời cho người ăn chay)

### Nguồn Carbohydrate (Tinh bột)
- **Cơm trắng (đã nấu chín):** 130 kcal | 2.7g Protein | 28g Carb | 0.3g Fat
- **Cơm gạo lứt (đã nấu chín):** 110 kcal | 2.6g Protein | 23g Carb | 0.9g Fat (Giàu chất xơ, vitamin nhóm B)
- **Khoai lang (luộc):** 86 kcal | 1.6g Protein | 20g Carb | 0.1g Fat
- **Yến mạch (chưa nấu):** 389 kcal | 16.9g Protein | 66g Carb | 6.9g Fat (Rất tốt cho tim mạch)
- **Bún tươi:** 110 kcal | 1g Protein | 25g Carb | 0g Fat
- **Phở tươi:** ~140 kcal | 1.5g Protein | 32g Carb | 0g Fat

### Nguồn Chất béo (Fat) & Rau củ (Fiber)
- **Quả bơ:** 160 kcal | 15g Fat (Chất béo không bão hòa đơn tốt cho tim)
- **Dầu oliu (1 muỗng canh ~15ml):** 119 kcal | 13.5g Fat
- **Đậu phộng (lạc rang):** 567 kcal | 25g Protein | 16g Carb | 49g Fat (Rất nhiều calo, cẩn thận khi ăn vặt)
- **Rau muống (luộc):** 30 kcal (Ít calo, giàu sắt và canxi)
- **Súp lơ xanh (Bông cải xanh):** 34 kcal (Chống oxy hóa, ngừa ung thư)

### Các món ăn ngoài quán (Ước tính 1 khẩu phần)
- **Phở bò (tô thường):** 400 - 500 kcal
- **Bún chả Hà Nội:** ~600 kcal
- **Cơm tấm sườn bì chả:** 700 - 800 kcal (Rất béo)
- **Bánh mì thịt chả:** 400 - 450 kcal
- **Trà sữa trân châu đường đen:** 400 - 500 kcal (Toàn đường và mỡ xấu)

---

## 3. Các Chế Độ Ăn (Dietary Guidelines)

### Chế độ Eat Clean (Ăn sạch)
- **Tiêu điểm:** Ưu tiên thực phẩm toàn phần (whole foods), giữ nguyên bản chất tự nhiên, chế biến đơn giản (luộc, hấp, áp chảo ít dầu).
- **Khuyến khích:** Gạo lứt, hạt quinoa, ức gà, cá biển, dầu oliu, rau củ quả tươi.
- **Từ chối:** Xúc xích, thịt xông khói, mì gói, nước ngọt, đường hóa học, bột ngọt quá liều.

### Chế độ Keto (Ketogenic)
- **Tiêu điểm:** Cắt giảm tối đa Carb (dưới 50g/ngày), ăn lượng mỡ cao và đạm vừa phải để ép cơ thể đốt mỡ làm năng lượng.
- **Khuyến khích:** Bơ, phô mai, dầu dừa, thịt ba rọi, cá hồi, trứng, quả bơ, rau chân vịt.
- **Từ chối:** Cơm, phở, khoai, đường, bánh ngọt, táo, chuối, dưa hấu.
- **Tác dụng phụ:** Có thể bị "Keto Flu" (cúm Keto) trong tuần đầu tiên (đau đầu, mệt mỏi) do cơ thể thiếu đường. Cần bổ sung nhiều nước và điện giải.

### Chế độ Ăn Chay (Vegetarian / Vegan)
- **Vegetarian:** Có thể ăn trứng và sữa.
- **Vegan (Thuần chay):** Cấm mọi chế phẩm từ động vật.
- **Lưu ý dinh dưỡng:**
  - Kết hợp các nguồn đạm thực vật để đủ axit amin thiết yếu: Đậu đỏ ăn cùng cơm trắng, bánh mì phết bơ đậu phộng.
  - Phải bổ sung Vitamin B12, Canxi và Sắt (vì sắt thực vật khó hấp thụ hơn sắt động vật, cần uống cùng nước cam/chanh để Vitamin C giúp hấp thu).

### Chế độ Traditional (Ăn uống truyền thống Việt Nam)
- Cơm canh mặn ngọt. Lưu ý: Thường bị dư thừa muối (sodium) do thói quen dùng nhiều nước mắm, xì dầu. Người bị cao huyết áp cần giảm lượng nước dùng và nước chấm.

---

## 4. Dinh Dưỡng Theo Tình Trạng Bệnh Lý Căn Bản

### Bệnh Tiểu đường (Diabetes)
- **Nguyên tắc:** Ổn định đường huyết. Ưu tiên thực phẩm có chỉ số đường huyết (GI) thấp.
- **Nên:** Gạo lứt, yến mạch nguyên cám, rau lá xanh, trái cây ít ngọt (ổi, bưởi, táo).
- **Không nên:** Cơm trắng ăn quá no, bánh kẹo ngọt, sầu riêng, mít, trà sữa.
- **Mẹo:** Ăn rau trước khi ăn cơm và thịt để tạo lớp màng làm chậm quá trình hấp thu đường.

### Bệnh Cao huyết áp (Hypertension)
- **Nguyên tắc:** Chế độ ăn DASH (Dietary Approaches to Stop Hypertension), cắt giảm Natri.
- **Nên:** Chuối, dưa hấu, cần tây (giàu Kali giúp hạ huyết áp).
- **Không nên:** Dưa cà muối chua, cá khô, thịt xông khói, mì tôm, đồ đóng hộp (cực kỳ nhiều muối). Không chấm thêm nước mắm khi ăn thức ăn đã nêm vừa.

### Bệnh Dạ Dày (Stomach Ulcer)
- **Nguyên tắc:** Thức ăn mềm, dễ tiêu hóa.
- **Nên:** Cơm nát, cháo, canh súp hầm nhừ, chuối chín, đu đủ.
- **Không nên:** Cà phê lúc bụng đói, ớt, chanh, đồ quá chua cay, nước ngọt có ga, đồ ăn khô cứng.

---

## 5. Lời Khuyên Dành Cho AI Khi Tương Tác (System Prompt Context)

1. **Từ chối kê đơn y tế:** Nếu người dùng hỏi "Tôi bị suy thận thì uống thuốc gì?" hoặc "Thực đơn chữa bách bệnh", AI PHẢI từ chối và khuyên họ đi gặp bác sĩ. AI chỉ tư vấn về *dinh dưỡng tổng quan*.
2. **Khuyến khích và Tích cực:** Luôn động viên người dùng. Nếu họ trót ăn một bữa quá nhiều calo, hãy an ủi "Không sao đâu, một bữa không làm bạn béo lên, hãy quay lại quỹ đạo vào ngày mai nhé".
3. **Phân tích logic:** Khi người dùng cung cấp tên món ăn không có lượng calo chính xác, AI hãy sử dụng thông tin từ Section 2 (thịt heo, gạo, dầu ăn) để dự đoán và bóc tách thành phần calo cho họ hiểu.
4. **Hỏi lại Pantry:** Khuyến khích nhắc người dùng "Nếu bạn có sẵn nguyên liệu gì trong tủ lạnh (Pantry), hãy nói để tôi gợi ý món ăn giúp bạn tiết kiệm thời gian nhé!".
