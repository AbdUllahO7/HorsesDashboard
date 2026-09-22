# دليل ريكويستات مشروع سوق الخيول (Horses Market) لمبرمج الويب

## 1. نبذة عن المشروع

**Horses Market** منصة سوق إلكتروني متخصصة في الخيول ومستلزماتها. تجمع البائعين (أصحاب المتاجر والإسطبلات والمعلنين) مع المشترين في مكان واحد، وتتيح:

- **عرض المنتجات** (خيول ومستلزمات) بسعر ثابت، مع التصنيف حسب الفئة والسلالة.
- **المزادات**، والمزايدة فيها لحظيًا (Real-time).
- **البث المباشر** للبائعين، مع تعليقات وعدد مشاهدين لحظي.
- **المحادثات** بين المشتري والبائع.
- **الاشتراكات والباقات المدفوعة** للبائعين (تمييز المنتجات، إنشاء مزادات، البث المباشر...).
- **المحفظة** وشحن الرصيد وسجل العمليات.
- **الإشعارات** و**الشكاوى** و**البلاغات**.
- **توثيق الحساب** بصور الهوية، وتراجعه الإدارة قبل التفعيل.

### أنواع المستخدمين (Roles)

| الدور | الوصف |
|---|---|
| `Customer` | المشتري: يتصفح ويزايد ويراسل البائع ويشاهد البث |
| `StoreOwner` | صاحب متجر: يضيف منتجات ومزادات ويبث مباشرة |
| `StableOwner` | صاحب إسطبل: صلاحياته قريبة من صاحب المتجر |
| `Advertiser` | معلن: له ملف تجاري خاص |
| `Admin` | الإدارة (لوحة التحكم، وليست جزءًا من هذا الدليل) |

---

## 2. معلومات عامة عن الاتصال بالسيرفر

| البند | القيمة |
|---|---|
| Base URL للـ API | `https://api.horses.market/api/` |
| رابط السيرفر (للصور و SignalR) | `https://api.horses.market` |
| رابط الصور | `https://api.horses.market/img/{imageName}` |

### الهيدرز المرسلة مع كل ريكويست

```http
Accept: application/json
Content-Type: application/json          # يُحذف عند إرسال multipart/form-data
Accept-Language: ar
lang: ar
Authorization: Bearer {accessToken}      # التوكن الذي يرجعه تسجيل الدخول
```

### ملاحظات مهمة

- الريكويستات التي ترفع صورًا أو ملفات تُرسل بصيغة **`multipart/form-data`**.
- الترقيم (Pagination) يتم عبر `PageNumber`، و`PageSize` أحيانًا.
- الاستجابة غالبًا بالشكل: `{ statusCode, message, data }`.
- إذا كانت قيمة `statusCode` داخل الاستجابة **405**، فمعناها أن الجلسة انتهت: يجب تسجيل خروج المستخدم وتحويله لصفحة الدخول مع عرض `message`.
- مسار الصور القديم `/auctionImg/` أو `/storeImg/` يجب تحويله إلى `/img/`.

### أنواع الباقات `featureType`

| القيمة | المعنى |
|---|---|
| `1` | مزاد |
| `2` | إعلان (تمييز) منتج |
| `3` | بث مباشر |
| `4` | باقة منتجات (Product Package) |

---

## 3. الريكويستات

> المسارات أدناه تُضاف بعد الـ Base URL.

### 3.1 المصادقة والحساب (Auth)

| Method | Endpoint | الهدف ومتى يُستخدم |
|---|---|---|
| POST | `Auth/Register` | إنشاء حساب جديد. البيانات `FullName, PhoneNumber, Password, RoleName` تُرسل كـ Query Params، وصور الهوية (`FrontIdentityImage, BackIdentityImage, SelfieWithIdentityImage`) كـ multipart. الإدارة تراجع الصور قبل تفعيل الحساب |
| POST | `Auth/VerifyOtp` | تأكيد رقم الهاتف بالكود المرسل بعد التسجيل. Body: `{ phone, code }` |
| POST | `Auth/ResendOtp` | إعادة إرسال كود التحقق إذا لم يصل أو انتهت صلاحيته. Body: `{ phoneNumber }` |
| POST | `Auth/Login` | تسجيل الدخول. Body: `{ phone_Number, password }`. يرجع بيانات المستخدم ودوره و`accessToken` و`refreshToken` |
| POST | `Auth/ForgotPassword?PhoneNumber=` | طلب كود لاستعادة كلمة المرور عند نسيانها |
| POST | `Auth/ResetPassword` | تعيين كلمة مرور جديدة بعد استلام الكود. Body: `{ phoneNumber, otpCode, newPassword }` |
| POST | `Auth/UpdateVerificationFiles` | إعادة رفع صور الهوية عندما ترفض الإدارة التوثيق (multipart بنفس أسماء حقول التسجيل) |
| POST | `Auth/Logout?RefreshToken=` | تسجيل الخروج وإبطال الـ Refresh Token على السيرفر |
| DELETE | `Auth/DeleteMyAccount` | حذف الحساب نهائيًا بطلب من المستخدم |

### 3.2 الاشتراكات والباقات والدفع

| Method | Endpoint | الهدف ومتى يُستخدم |
|---|---|---|
| GET | `Subscription/GetMyPlan` | جلب خطة الاشتراك المناسبة لدور المستخدم (السعر والمميزات) قبل الدفع |
| GET | `Subscription/GetCurrentSubscription` | معرفة حالة اشتراك البائع الحالي (فعّال أو منتهٍ، وتاريخ الانتهاء). يُستخدم لإظهار المميزات المدفوعة أو قفلها |
| POST | `Payments/CreateSubscriptionPayment` | بدء عملية دفع الاشتراك. Body اختياري: `{ coupon_Code }`. يرجع رابط بوابة الدفع (`paymentUrl` / `url` / `redirectUrl` / `checkoutUrl`) لتحويل المستخدم إليه |
| POST | `Payments/CreateWalletTopupPayment` | بدء عملية شحن رصيد المحفظة. Body: `{ amount }`. يرجع رابط الدفع |
| GET | `Payments/CheckPaymentStatusTester?paymentId=` | التحقق من نجاح الدفع بعد عودة المستخدم من البوابة، أو إذا لم يرجع رابط دفع |
| GET | `FeaturePlansManagement/GetPlans?featureType=` | جلب الباقات المتاحة لميزة معينة (مزاد، تمييز منتج، بث، باقة منتجات) ليختار البائع منها |
| POST | `ProductPackages/PurchasePackage?planId=&categoryId=` | شراء باقة منتجات لفئة معينة، لتفتح للبائع إمكانية النشر في تلك الفئة |

### 3.3 الفئات والسلالات

| Method | Endpoint | الهدف ومتى يُستخدم |
|---|---|---|
| GET | `Categories/GetAll?PageNumber=&IsActive=true` | جلب الفئات المفعّلة، للفلترة وعند إضافة منتج |
| GET | `Categories/GetCategoriesOpeningClosing?HasActivePackage=&PageNumber=` | جلب الفئات مع حالة كل منها للبائع (مفتوحة أو مغلقة حسب امتلاكه باقة فعّالة)، لمعرفة أين يستطيع النشر |
| GET | `Breeds/GetAll?PageNumber=&IsActive=true` | جلب سلالات الخيول، للفلترة وعند إضافة منتج |

### 3.4 المنتجات

| Method | Endpoint | الهدف ومتى يُستخدم |
|---|---|---|
| GET | `Products/GetProducts` | عرض المنتجات للمشترين مع البحث والفلترة والترقيم (`PageNumber`, `PageSize`...). ويُستخدم أيضًا مع `UserId` لعرض منتجات بائع معين |
| GET | `Products/GetProductById?id=` | جلب تفاصيل منتج واحد (الصور والسعر والعمر والوزن والسلالة...) |
| GET | `Products/GetMyProducts?PageNumber=` | جلب منتجات البائع الحالي لإدارتها |
| POST | `Products/Create` | إضافة منتج (multipart). الحقول: `Name, Description, Fixed_Price, Category_Id, Breed_Id, Age, Address, Wight`، والصور في `Images` |
| POST | `Products/Update?id=` | تعديل منتج. نفس الحقول مع `Weight`، و`Old_Images` (معرفات الصور التي يُبقى عليها)، والصور الجديدة في `New_Images` |
| POST | `Products/Delete?id=` | حذف منتج من منتجات البائع |

### 3.5 المزادات

| Method | Endpoint | الهدف ومتى يُستخدم |
|---|---|---|
| GET | `Auctions/GetAuctions` | عرض المزادات للمشترين مع الترقيم والفلترة. ويُستخدم مع `UserId` لعرض مزادات بائع معين |
| GET | `Auctions/GetById?id=` | تفاصيل مزاد (السعر الحالي وسجل المزايدات والوقت المتبقي والحالة) |
| POST | `Auctions/PlaceBid` | تقديم مزايدة من المشتري. Body: `{ auction_Id, amount }` |
| POST | `Auctions/Create` | إنشاء مزاد جديد من البائع (multipart). الحقول: `Title, Description, Address, Start_Price, FeaturePlanId`، والصور في `Images` |
| GET | `Auctions/GetMyAuctions` | جلب مزادات البائع الحالي لمتابعتها |

### 3.6 المتاجر والملفات الشخصية

| Method | Endpoint | الهدف ومتى يُستخدم |
|---|---|---|
| GET | `Users/GetStores?PageNumber=&PageSize=` | عرض قائمة المتاجر والبائعين للمشترين |
| GET | `Users/GetBusinessProfileDetails?userId=` | عرض الملف التجاري لبائع معين (معلومات المتجر وطرق التواصل والموقع) |
| GET | `Users/GetMyBusinessProfile` | جلب الملف التجاري للبائع الحالي (صاحب متجر أو إسطبل) |
| GET | `Users/GetMyAdvertiserProfile` | جلب الملف الخاص بالمعلن الحالي، ويُستخدم بدل السابق إذا كان الدور `Advertiser` |
| POST | `Users/UpdateMyBusinessProfile` | تعديل الملف التجاري (multipart): `Full_Name, Store_Name, Description, Whatsapp_Number, Profile_Email, Address, City, Google_Map_Link`، مع صور الملف أو الغلاف |
| GET | `Users/GetMyCustomerProfile` | جلب بيانات حساب المشتري |
| POST | `Users/UpdateMyProfile` | تعديل بيانات المشتري (multipart): `FullName` مع الصورة الشخصية |

### 3.7 البث المباشر

| Method | Endpoint | الهدف ومتى يُستخدم |
|---|---|---|
| GET | `LiveStreams/GetLives` | عرض البثوث المباشرة الجارية للمشاهدين (`PageNumber`, `IsActive`) |
| POST | `LiveStreams/Start` | بدء بث جديد من البائع. Body: `{ live_Name, live_Description, featurePlanId }` |
| GET | `LiveStreams/GetToken?channelName=` | جلب توكن **Agora** للدخول لقناة البث (للبائع كمذيع وللمشاهد كمتفرج) |
| POST | `LiveStreams/End?id=` | إنهاء البث من البائع |
| GET | `LiveStreams/GetMyLives?PageNumber=&Search=` | سجل بثوث البائع السابقة |
| POST | `LiveRepots/AddRepotLive` | الإبلاغ عن بث مخالف من المشاهد. Body: `{ liveStream_Id, reason, notes }` |

> البث نفسه (الصوت والصورة) يعمل عبر **Agora RTC**. السيرفر يوفر التوكن فقط.

### 3.8 المحادثات

| Method | Endpoint | الهدف ومتى يُستخدم |
|---|---|---|
| GET | `Chat/GetConversations` | قائمة محادثات المستخدم |
| POST | `Chat/Start?sellerId=` | بدء محادثة جديدة مع بائع، أو جلب المحادثة الموجودة، عندما يريد المشتري التواصل |
| GET | `Chat/GetMessages?conversationId=` | جلب رسائل محادثة معينة |
| POST | `Chat/Send` | إرسال رسالة. Body: `{ conversation_Id, message }` |

### 3.9 الإشعارات

| Method | Endpoint | الهدف ومتى يُستخدم |
|---|---|---|
| GET | `Notifications/Get` | جلب إشعارات المستخدم |
| POST | `Notifications/MarkAsRead?id=` | تعليم إشعار كمقروء عند فتحه |
| POST | `Notifications/SaveToken` | حفظ توكن الجهاز لإرسال Push Notifications. Body: `{ deviceToken, platform }`. في الويب يمكن استخدام FCM Web Token مع `platform` مناسب (يُنسق مع الباك إند) |

### 3.10 المحفظة

| Method | Endpoint | الهدف ومتى يُستخدم |
|---|---|---|
| GET | `Wallets/GetMyWallet` | جلب رصيد المحفظة الحالي |
| GET | `Wallets/GetMyTransaction` | سجل عمليات المحفظة (شحن وخصم وفواتير) |

> شحن المحفظة يتم عبر `Payments/CreateWalletTopupPayment` ثم `Payments/CheckPaymentStatusTester`.

### 3.11 أخرى

| Method | Endpoint | الهدف ومتى يُستخدم |
|---|---|---|
| GET | `Ads/GetRandomAd` | جلب إعلان عشوائي يُعرض كنافذة منبثقة عند دخول المستخدم للصفحة الرئيسية |
| POST | `Complaints/Create` | تقديم شكوى على بائع. Body: `{ title, description, type, seller_Id }` |
| GET | `Admin/GetPrivacyPolicy` | جلب نص سياسة الخصوصية |
| GET | `Admin/GetTermsAndConditions` | جلب نص الشروط والأحكام |

---

## 4. الاتصال اللحظي (SignalR)

يستخدم المشروع **SignalR** للتحديثات اللحظية. تُمرر قيمة `accessToken` عبر `accessTokenFactory`، والرابط الأساسي هو `https://api.horses.market` (بدون `/api`).

| Hub | الهدف | الاستدعاءات (invoke) | الأحداث المستقبلة (on) |
|---|---|---|---|
| `/auctionHub` | تحديث المزاد لحظيًا أثناء فتح تفاصيله | `JoinAuctionGroup(auctionId)`، `LeaveAuctionGroup(auctionId)` | `ReceiveBidUpdate`: مزايدة جديدة أو سعر جديد. `AuctionEnded`: انتهى المزاد. `AuctionStopped`: أوقفته الإدارة |
| `/chatHub` | استقبال الرسائل فورًا داخل المحادثة | `JoinConversation(conversationId)` | `ReceiveMessage`: رسالة جديدة |
| `/liveHub` | تعليقات البث وعدد المشاهدين وإيقاف البث | `JoinLive(channelName)` | `ReceiveComment`: تعليق جديد. `ViewerCountUpdated`: عدد المشاهدين. `LiveEnded`: انتهى البث أو أوقفته الإدارة بسبب بلاغ |

---

## 5. تسلسلات الاستخدام الأساسية

**التسجيل:**
`Auth/Register` ← `Auth/VerifyOtp` ← انتظار موافقة الإدارة (وإذا رُفض التوثيق: `Auth/UpdateVerificationFiles`) ← `Auth/Login`

**اشتراك البائع:**
`Subscription/GetMyPlan` ← `Payments/CreateSubscriptionPayment` ← تحويل لرابط الدفع ← `Payments/CheckPaymentStatusTester` ← `Subscription/GetCurrentSubscription`

**إنشاء مزاد أو بث أو تمييز منتج:**
`FeaturePlansManagement/GetPlans?featureType=X` ← اختيار باقة ← `Auctions/Create` أو `LiveStreams/Start` مع معرف الباقة

**النشر في فئة مغلقة:**
`Categories/GetCategoriesOpeningClosing` ← `FeaturePlansManagement/GetPlans?featureType=4` ← `ProductPackages/PurchasePackage` ← `Products/Create`

**المزايدة:**
`Auctions/GetById` ← الاتصال بـ `/auctionHub` و`JoinAuctionGroup` ← `Auctions/PlaceBid` ← الاستماع لـ `ReceiveBidUpdate`

**التواصل مع بائع:**
`Chat/Start?sellerId=` ← `Chat/GetMessages` ← الاتصال بـ `/chatHub` و`JoinConversation` ← `Chat/Send`

**البث المباشر:**
- البائع: `LiveStreams/Start` ← `LiveStreams/GetToken` ← الدخول لـ Agora كمذيع ← `/liveHub` ← `LiveStreams/End`
- المشاهد: `LiveStreams/GetLives` ← `LiveStreams/GetToken` ← الدخول لـ Agora كمتفرج ← `/liveHub` (وإذا لزم: `LiveRepots/AddRepotLive`)
