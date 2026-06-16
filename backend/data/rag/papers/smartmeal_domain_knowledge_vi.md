# SmartMeal Domain Knowledge (Vietnamese)

## Muc tieu
Tai lieu nay tong hop schema du lieu, rule menu engine va pantry guide de chatbot RAG tra loi nhat quan trong du an SmartMeal.

## Recipe Schema Chinh
- id: ma dinh danh duy nhat.
- name_vi: ten mon an tieng Viet.
- region: Bac, Trung, Nam.
- category: main, soup, snack, dessert.
- meal_types: breakfast, lunch, dinner.
- difficulty: easy, medium, hard.
- servings: khau phan mac dinh.

## Nutrition Fields
- calories: calo (bat buoc).
- protein_g: dam (gram).
- carbs_g: tinh bot (gram).
- fat_g: chat beo (gram).
- fiber_g: chat xo (gram).
- sodium_mg: natri (mg).
- sugar_g: duong (gram).

## Price Fields
- price_estimate.min: gia thap nhat (VND).
- price_estimate.max: gia cao nhat (VND).
- currency: mac dinh VND.

## Thanh phan va cach nau
- ingredients: danh sach nguyen lieu theo amount + unit.
- utensils: dung cu can dung.
- steps: cac buoc che bien.
- scalable: ingredient co the scale theo servings.

## Dietary and Safety
- diet_tags: nhan che do an (vi du keto, vegetarian, eatclean, traditional, high_protein).
- allergens: danh sach di ung can tranh.
- suitable_for: doi tuong phu hop.
- avoid_for: doi tuong nen tranh.

## Nguyen tac tra loi uu tien
- Neu cau hoi lien quan dinh duong, uu tien nutrition fields.
- Neu cau hoi lien quan chi phi, uu tien price_estimate min/max.
- Neu cau hoi lien quan bua an, uu tien meal_types + category.
- Neu cau hoi lien quan vung mien, uu tien region.

## Menu Rules (Engine Summary)

### Tong quan
Engine goi y thuc don uu tien loc theo rang buoc nguoi dung, sau do chon mon theo meal type.

### Rang buoc so luong bua trong 1 ngay
- breakfast: 1 mon
- lunch: 2 mon
- dinner: 2 mon
Tong cong: 5 mon/ngay.

### Logic ngan sach theo ngay
He thong chia ngan sach ngay cho 5 mon.

Moc dang dung trong engine:
- < 175000 VND/ngay: uu tien mon 10000-30000 VND.
- 175000 den 350000 VND/ngay: uu tien mon 30000-40000 VND.
- > 350000 VND/ngay: uu tien mon 40000-50000 VND.

### Thu tu loc chinh
1. Loc allergen can tranh.
2. Loc region neu nguoi dung co chon.
3. Loc/trong so theo ingredient thich va tranh.
4. Chay bo rule diet/goal:
	- keto: carbs <= 25g/mac dinh.
	- vegetarian: can co tag vegetarian hoac vegan.
	- muscle_gain/high_protein: uu tien protein cao, nguong mac dinh >= 18g.
	- weight_loss: uu tien calo thap, protein/fiber cao; nguong hay dung <= 500 cal va >= 15g protein.
	- weight_gain: uu tien calo va carbs cao.
	- eatclean: gioi han calo bua an (thuong <= 800 cal).
	- traditional: uu tien mon cung region.

### Co che fallback khi khong du mon
- No rong dieu kien tung buoc (diet tag, protein, calories, budget).
- Thu lai de dat du mon toi thieu theo tung bua.

### Luu y chat luong tra loi
- Neu khong du context thi noi ro khong du du lieu.
- Khong tu y che threshold neu khong co context.
- Khi goi y mon, nen dinh kem ly do (budget, meal type, dinh duong, diet tag).

## Pantry Guide

### Muc dich
Mo ta du lieu pantry de chatbot RAG co the tra loi dung ve ton kho, bao quan va han su dung.

### Pantry Schema Chinh
- user: pantry item thuoc ve 1 user cu the.
- name: ten thuc pham.
- quantity: so luong (> 0).
- unit: g, kg, ml, l, pcs, pack, bottle, can.
- storageLocation: fridge, freezer, pantry, room.
- expiryDate: ngay het han (du lieu goc de tinh trang thai fresh/expiring/expired).
- category: protein, vegetable, fruit, grain, dairy, condiment, beverage, other.
- openedDate: ngay mo goi (optional).
- notes: ghi chu them.

### Nguyen tac dien giai pantry context trong RAG
- Neu includePantryContext bat, truy van co them danh sach item pantry cua user.
- Pantry context giup uu tien mon an phu hop voi nguyen lieu dang co.
- Neu user chua co item nao trong pantry, phai noi ro khong co du lieu pantry.

### Quy uoc tra loi
- Khi nhac den bao quan, phai su dung storageLocation hop le.
- Khong doan han su dung neu khong co expiryDate.
- Neu thong tin pantry thieu, yeu cau user bo sung ten, so luong, don vi, ngay het han.
