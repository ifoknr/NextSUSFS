# NextSUSFS changelog

## v0.0.7
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
