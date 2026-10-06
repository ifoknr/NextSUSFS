# NextSUSFS changelog

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
