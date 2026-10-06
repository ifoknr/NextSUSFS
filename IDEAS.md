# NextSUSFS — ideas for later

Not started. Each one needs testing on a real device before it ships.

## Hiding strength
1. **Leak scanner.** A page that checks, from an app's point of view, whether hiding actually
   works: run a probe as a normal app UID inside an unmounted namespace and report any root
   paths, mounts, maps or properties it can still see.
2. **Find root traces.** Scan internal storage and /data/local/tmp for known root-tool folders
   (MT Manager, Termux, backups, ROM zips) and offer to add them to a list with one tap.
3. ~~Hide the backup folder.~~ Done in v0.0.3.
4. **Stock kernel names per device.** A small table of real stock `uname` values by model, so
   "Use my own kernel name" can be filled in for the user.

## Ease of use
5. **Profiles.** One-tap sets of switches: Banking, Games, Maximum. Shows what each changes.
6. **Apply without reboot.** Some options (developer options, USB debugging, properties,
   extra hidden paths) can be applied live; mark those and apply them right away.
7. **Auto-backup on update.** Keep the last settings and lists when the module is updated or
   reinstalled.

## Linking the tools
8. **Shared status card.** NextWheel and NextZygisk show how many paths NextSUSFS hid at the
   last boot, read from its status file.
9. **One hide list.** Paths added in NextWheel or HMA-OSS show up in NextSUSFS's lists, and
   the other way round.
10. **Kernel advisor.** When a kernel feature is missing, explain what it loses and link the
    matching GKID kernel build.

## Diagnostics
11. **Boot timing.** Record how long each boot stage took and warn when a switch (such as
    Extreme ROM file hiding) slows boot noticeably.
12. **Share a report.** One button that bundles logs, settings and kernel features into a
    file for bug reports, with personal paths removed.
