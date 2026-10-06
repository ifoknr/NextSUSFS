# NextSUSFS changelog

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
