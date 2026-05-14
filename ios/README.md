# مسرح الأفكار للايفون

هذا المجلد يحتوي مشروع iOS بسيط يفتح تطبيق الويب الموجود في `../index.html` داخل `WKWebView`.

## إنشاء IPA

يتطلب إنشاء ملف `.ipa` قابل للتثبيت:

- تثبيت Xcode الكامل، وليس Command Line Tools فقط.
- اختيار Xcode عبر:

```sh
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

- حساب Apple Developer أو فريق توقيع متاح داخل Xcode.

بعد فتح المشروع:

1. افتح `TheaterOfIdeas.xcodeproj` في Xcode.
2. من إعدادات الهدف `TheaterOfIdeas` اختر `Signing & Capabilities`.
3. اختر فريقك وعدّل `Bundle Identifier` إذا احتجت.
4. اختر `Any iOS Device`.
5. استخدم `Product > Archive`.
6. من نافذة Organizer اختر `Distribute App` لإخراج ملف IPA.

يمكن أيضاً استخدام `xcodebuild` بعد تجهيز التوقيع.
