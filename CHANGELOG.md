# NextSUSFS changelog

<!-- Each "## vX.Y.Z" section is the release notes and the Telegram post: the Arabic bullets, then a line "**English**" and the same bullets in English. Keep it short (about 760 characters). Commits show IFOKNR only. -->

## v0.0.14
- جديد: «إخفاء مجلدات مدير الروت» — يحذف مجلدات تطبيقات KernelSU و KernelSU-Next و APatch من Android/data و media و obb ويبقيها محذوفة، فتطبيق عنده صلاحية التخزين ما يلقاها. مطفي افتراضياً.
- جديد: «إخفاء التطبيقات من التعداد» — يخفي تطبيقاتك المثبّتة من syscalls (priority/ioprio) اللي تستغلها بعض الكواشف لسرد التطبيقات، عبر `set_priority_uid_filter` في SuSFS. يحتاج كيرنل SuSFS حديث يدعم الميزة؛ يُتجاهل على الكيرنل القديم فما يكسر شي. مطفي افتراضياً. (حُدّث ثنائي ksu_susfs لـ arm64 لدعم الأمر.)

- شكل جديد: أيقونة رمادية هادية مثل باقي أدوات IFOKNR، واسم الأداة بخط جديد فوق، وتوقيع IFOKNR في صفحة الحقوق.
**English**
- New: "Hide root manager folders" — removes the KernelSU, KernelSU-Next and APatch app folders from Android/data, media and obb and keeps them cleared, so an app with storage access can't find them. Off by default.
- New: "Hide apps from enumeration" — hides your installed apps from the priority/ioprio syscalls some detectors abuse to list apps, via SuSFS `set_priority_uid_filter`. Needs a recent SuSFS kernel that supports it; ignored on older kernels, so nothing breaks. Off by default. (The bundled arm64 ksu_susfs was updated to support the command.)
- New look: a calm grey icon like the other IFOKNR tools, the name in new lettering at the top, and IFOKNR's signature in the credits.

## v0.0.13
- واجهة رئيسية جديدة بالكامل: لوحة معلومات على طراز NextZygisk — بطاقة حالة رئيسية مع إحصائيات، بطاقات الحالة والأقسام، معلومات الجهاز، وشبكة أدوات. تشتغل بالوضعين الفاتح والداكن و RTL، وعمودين على التابلت.
- إصلاح: على الرومات المخصصة كان «إخفاء ملفات الروم المخصص» يحجب ملفات صلاحيات/إعدادات النظام (permissions و sysconfig و privapp_whitelist) حجباً كاملاً، فترجع «غير موجودة» للتطبيقات المدرجة بالقائمة مثل خدمات قوقل بلاي وتسبّب بطء أو تعليق. الحين تبقى مقروءة (نسخة منزوع منها اسم الروم)، فيشتغل كل شي والنظام يقرأ الأصلي والكاشف ما يشوفها.

**English**
- Brand-new Home: a NextZygisk-style dashboard — a hero status card with stats, status and section cards, device info and a tools grid. Works in light, dark and RTL, two columns on tablets.
- Fixed: on custom ROMs, "Hide custom ROM files" fully path-hid system permission/config files (permissions, sysconfig, privapp_whitelist), returning ENOENT to denylisted apps such as Google Play Services and causing lag or hangs. They now stay readable (with the ROM name stripped), so everything keeps working, the system reads the real file, and detectors still don't see them.

## v0.0.12
- إصلاح: على رومات الـ GSI كثيرة الـ overlay (مبنية على LineageOS/crDroid) كان خيار «إخفاء ملفات الروم المخصص» يحجب عن التطبيقات ملفات تحتاج تفتحها: حِزَم التطبيقات المثبّتة (priv-app/app) وملفات الـ overlay و idmap و dalvik-cache و ART profiles وأي ملف قابل للتحميل (apk/jar/so). النتيجة كانت تعليق التطبيقات عند الفتح. الحين هذي الملفات تنخفي من خرائط الذاكرة فقط (مكان الكشف)، وتظل التطبيقات تقدر تفتحها. ملفات الإعداد (xml/rc) تظل مخفية بالمسار.

**English**
- Fixed: on overlay-heavy GSIs (LineageOS/crDroid based), "Hide custom ROM files" blocked files apps must reopen: installed app packages (priv-app/app), overlay APKs, idmaps, dalvik-cache, ART profiles and any loadable file (apk/jar/so). Apps hung on launch. These are now hidden from memory maps only (where detectors look) and stay openable; config files (xml/rc) are still path-hidden.

## v0.0.11
- إصلاح: خاصية التشفير `ro.crypto.state` كانت تُضبط بدري جداً في مرحلة post-fs-data، قبل ما يستقر نظام التشفير (vold)، فتبتلع إشارة الانتقال اللي تنتظرها مشغّلات vendor، وتسبّب مشاكل إقلاع على بعض الأجهزة. الحين تُضبط بعد اكتمال الإقلاع. (مصدره BRENE #61)
- جديد: خيار «تصغير مخزّن السجلات» (إضافات الشاشة): يضبط مخزّن logcat و logd على 64K لاستهلاك أقل للمعالج والبطارية. اختياري ومطفي افتراضياً. (من BRENE v0.0.71)

**English**
- Fixed: `ro.crypto.state` was set too early (post-fs-data, before vold settled), which could swallow the encrypted-state transition that vendor init triggers wait on and break boot on some devices. It is now set after boot completes. (from BRENE #61)
- New: a "Shrink log buffers" option (Display extras) that sets the logcat and logd buffers to 64K for less CPU and battery use. Optional, off by default. (from BRENE v0.0.71)

## v0.0.10
- جديد: وضع نهاري/ليلي للواجهة. مفتاح في الإعدادات (النظام / داكن / فاتح)؛ خيار «النظام» يتبع إعداد جهازك ويتغيّر فورًا. الوضع الداكن يبقى الافتراضي، وكل الصفحات صارت واضحة في الوضع الفاتح.

**English**
- New: a day/night theme for the WebUI. A switch in Settings (System / Dark / Light); "System" follows your device's appearance and updates live. Dark stays the default, and every page now reads cleanly in light mode.

## v0.0.9
- إصلاح: إخفاء نصوص الروم في ملفات السياسة كان لا يشتغل على الرومات المبنية على LineageOS (crDroid، Evolution، إلخ). كان يبحث عن اسم الروم المكتشف بدل «lineage»، فيتخطّى ملفات sepolicy. الآن يشيل كل أسماء الرومات.
- إصلاح: التحويل (open redirect) ما كان يمسك الملفات اللي تحت /system_ext و/product و/vendor، لأنها روابط رمزية والكاشف يقرأها بمسارها المختصر. الآن يُسجّل التحويل لكل المسارات المكافئة.
- إصلاح: إضافة مسار في القوائم كان يرفضه أحياناً بحجة «لازم يبدأ بـ/» رغم إنه صحيح، بسبب محرف اتجاه مخفي من لوحة المفاتيح العربية. الآن يُنظَّف المحرف قبل الحفظ.
- تحسين: رسالة واضحة لقائمة Open redirect (مسار، مسار بديل، نطاق) بدل رسالة مضلّلة.

**English**
- Fixed: hiding ROM strings in policy files did nothing on LineageOS-based ROMs (crDroid, Evolution, ...). It searched for the detected brand instead of "lineage", so it skipped the sepolicy files. It now strips every ROM name.
- Fixed: open redirect missed files under /system_ext, /product and /vendor, which are symlinks that detectors read by their short path. The redirect is now registered for every equivalent path.
- Fixed: adding a path to a list was sometimes rejected as "must start with /" although it was correct, because of a hidden direction mark from the Arabic keyboard. The mark is now stripped before saving.
- Improved: a clear message for the Open redirect list (path, new path, scope) instead of a misleading one.

## v0.0.8
- علامة روم مخصص/رسمي في الرئيسية وبطاقة الجهاز، تُكتشف من الخصائص قبل ما يخفيها الموديول.
- «تنظيف هوية البناء» (للروم المخصص): يعيد كتابة البصمة ووصف البناء والنكهة ورقم البناء والنوع لكل الأقسام بشكل رسمي موحّد، بدون test-keys ولا اسم الروم، قبل تشغيل التطبيقات.
- «إخفاء نصوص الروم في ملفات السياسة»: صار يعرض نسخة حقيقية من sepolicy و.rc محذوف منها أسطر اسم الروم فقط، بدل ملف فاضي يفضح نفسه.
- خيار منفصل: «إخفاء أسطر الروت في ملفات init» (resetprop و magisk و زيجيسك).
- خيار «تاريخ قديم لـ/debug_ramdisk» لكل الرومات.
- صفحة «فحص الآثار»: كاشف مصغّر يعرض كل أثر وحالته مع زر إصلاح.
- كل الخيارات الجديدة اختيارية ومطفية افتراضياً، وخيارات الروم المخصص تختفي على الروم الرسمي.

**English**
- Custom/stock ROM badge on Home and the device card, detected before the module hides the traces.
- "Clean build identity" (custom ROMs): rewrites fingerprint, description, flavor, build number and type across all partitions into one stock-looking set, without test-keys or the ROM name, before apps start.
- "Hide ROM strings in policy files" now shows a real copy of sepolicy and .rc files with only the ROM-name lines removed, instead of an empty file that gives itself away.
- Separate option: "Hide root lines in init files" (resetprop, magisk, zygisk).
- "Old date for /debug_ramdisk" option, for every ROM.
- "Trace check" page: a mini detector showing each trace and whether it is covered, with a fix link.
- Every new option is off by default, and custom-ROM options are hidden on a stock ROM.

## v0.0.7
- Fixed: NextSUSFS turned KernelSU's kernel umount back on at boot after NextZygisk had
  turned it off, so both unmounted the same apps on every launch. With NextZygisk installed
  and enabled, NextSUSFS now leaves kernel umount to it.
- Boot-loop protection (Safe Mode): if the last three boots never finished, the next
  boot skips all hiding so the device comes up, and the Home screen warns you that your
  settings were skipped and offers a reboot to retry. A successful boot clears it.
- New list: Spoof file stats. Paths listed here are shown to apps with an old, untouched
  timestamp, so a system file you edited does not give itself away by its modify time.
- System properties: a "Restore real values now" button puts spoofed properties back to
  their real values immediately, without a reboot.
- Navbar: equal-width icons with a pill that slides to the active tab; you can drag across
  the bar to switch, and it slides out of the way while you scroll down.
- New list: Open redirect (from BRENE v0.0.70). Each line is "<path> <new path> <scope>":
  opening the path opens the new path instead, for the processes in the scope (0 to 4,
  3 is apps without root). The WebUI explains the scopes and checks each line before
  saving; the boot script applies the list with SuSFS open_redirect.
- Fixed: with "Hide custom ROM files" on, apps that use an app zygote (for example the
  Chunqiu Native Check detector) crashed on launch with "Failed open(/system/framework/
  org.lineageos.platform-res.apk)". Zygote keeps framework files open and every app zygote
  reopens them, so hiding them from apps made that reopen fail. Files under a framework
  folder are now hidden from memory maps only.

## v0.0.6
- Tools page, Play Integrity: Play Integrity Fork, TEESimulator and Tricky Addon next to
  AlwaysStrong, with their install status. Use AlwaysStrong alone, or the three together.
- Tools page, detection apps: Key Attestation (VisionR1) and VD Google.
- Tools page, Community: the BeNeXTBrO Telegram group and the developer's GitHub, with a
  note on where to ask for help or send ideas.
- Tricky Addon's module folder is hidden at boot, like the other integrity modules.

## v0.0.5
- Fixed: the module banner did not show in the root manager. module.prop now points to it
  relative to the module folder (banner=banner.png), which is the form managers load.

## v0.0.4
First public release.

**Highlights**
- Kernel-level root hiding with SuSFS v2 for KernelSU and its forks, on arm64, arm, x86 and x86_64.
- Hides the NEXT stack (NextWheel, NextZygisk, NextSUSFS) plus AlwaysStrong, Play Integrity Fix
  and HMA-OSS automatically at every boot.
- WebUI with over 40 settings on 7 pages, your own path lists, kernel features, logs, backup
  and reset, in English and Arabic, for phones and tablets.
- Tools page with the NEXT stack, root hiding, Play Integrity and detection apps (Native
  Detector, TrustAttestor, KKND Detector).
- Status shown in NextWheel and NextZygisk; module banner in the root manager.

**Fixes in this version**
- Fixed: on some managers the module installed with only a few files, so the WebUI hung on
  opening and the status stayed on "Waiting for reboot". The installer no longer copies
  itself into /data/adb/modules during install; the manager moves it in at the next boot.
- Action button now prints a NextSUSFS status report (SuSFS, kernel features, NEXT stack,
  your lists) instead of a placeholder.
- Module card text shows only NextSUSFS; credits stay in the WebUI's About and the README.
- Module banner and a "personal project, use at your own risk" note in About.

## v0.0.3
- Hiding: AlwaysStrong (tricky_store), Play Integrity Fix and HMA-OSS folders and Zygisk
  libraries are hidden automatically, without kernel umount so Play services keep working.
- New options in Paths & files: hide every module's Zygisk library from memory maps (on),
  hide the backup folder (on), hide /data/adb completely (off, experimental).
- Tools: "NEXT stack" now lists NextWheel and NextZygisk; HMA-OSS moved to a new Root
  hiding section; new Detection apps section (Native Detector, TrustAttestor, KKND
  Detector) with an Open button when installed.
- Tablets: content fills the screen width like NextWheel and NextZygisk.
- Fonts: Sora now also covers Latin Extended letters; shared font set with the other tools.

## v0.0.2
- WebUI: every engine option now has a control (41 settings) across 7 pages: Paths & files,
  Custom ROM, Kernel identity, System properties, KernelSU, Developer & debugging, Display.
- New pages: Kernel features, Your lists (edit the four custom path lists), Logs (read, copy,
  clear), Backup & reset.
- New Hiding tab with a page hub; Home shows an overview of each page.
- Language picker (System / English / Arabic), detailed-logs switch and a reboot button in
  Settings. A bar offers a reboot after any change.
- Text settings (custom kernel name, verified boot hash) are validated before saving.
- AlwaysStrong (evoker0) replaces TrickyStore/PIF/Tricky Addon in Tools; tool names open
  the developer's page.
- English font changed from Orbitron to Sora.
- Fixed: in Arabic the switch knob slid outside its track.

## v0.0.1
- First release. Fork of BRENE, rebuilt to work with NextWheel and NextZygisk.
- WebUI redesigned to match the NextWheel/NextZygisk look.
- Installs on any CPU (arm64/arm/x86/x64); ksu_susfs built from simonpunk v2.3.0.
- Installs on kernels without SuSFS and reports it instead of aborting.
