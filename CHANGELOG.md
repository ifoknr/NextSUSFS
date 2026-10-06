# NextSUSFS changelog

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
