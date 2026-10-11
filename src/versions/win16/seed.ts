import type { FsSeed } from '../../core'
import type { Variant } from './context'

/** Binaries are stubs: the virtual FS only needs them to exist (sizes are faked for display). */
const BIN = 'MZ'
const crlf = (lines: string[]) => lines.join('\r\n') + '\r\n'
const bins = (dir: string, names: string[]): FsSeed => Object.fromEntries(names.map(n => [`${dir}/${n}`, BIN]))

const AUTOEXEC: Record<Variant, string> = {
  win1: crlf(['ECHO OFF', 'PROMPT $P$G', 'PATH C:\\;C:\\DOS;C:\\WINDOWS', 'MODE CO80', 'CD \\WINDOWS', 'WIN']),
  win2: crlf(['ECHO OFF', 'PROMPT $P$G', 'PATH C:\\;C:\\DOS;C:\\WINDOWS', 'SET TEMP=C:\\TEMP', 'CD \\WINDOWS', 'WIN']),
  win3: crlf(['@ECHO OFF', 'C:\\DOS\\SMARTDRV.EXE /X', 'PROMPT $p$g', 'PATH C:\\WINDOWS;C:\\DOS', 'SET TEMP=C:\\WINDOWS\\TEMP', 'LH C:\\DOS\\MOUSE.COM /Y', 'WIN']),
}

const CONFIG: Record<Variant, string> = {
  win1: crlf(['FILES=20', 'BUFFERS=20']),
  win2: crlf(['FILES=30', 'BUFFERS=20', 'DEVICE=C:\\WINDOWS\\HIMEM.SYS']),
  win3: crlf(['DEVICE=C:\\DOS\\SETVER.EXE', 'DEVICE=C:\\WINDOWS\\HIMEM.SYS', 'DOS=HIGH,UMB', 'DEVICE=C:\\WINDOWS\\EMM386.EXE NOEMS', 'FILES=40', 'BUFFERS=30', 'STACKS=9,256', 'SHELL=C:\\DOS\\COMMAND.COM C:\\DOS\\ /p']),
}

const WIN_INI_1 = crlf([
  '[windows]', 'spooler=yes', 'load=', 'run=', 'Beep=yes', 'NullPort=None', 'BorderWidth=5', 'KeyboardSpeed=7',
  'CursorBlinkRate=530', 'DoubleClickSpeed=452', 'Programs=com exe bat', 'Documents=', 'device=Epson FX-80,EPSON,LPT1:', '',
  '[extensions]', 'cal=calendar.exe ^.cal', 'crd=cardfile.exe ^.crd', 'trm=terminal.exe ^.trm', 'txt=notepad.exe ^.txt',
  'ini=notepad.exe ^.ini', 'msp=paint.exe ^.msp', 'wri=write.exe ^.wri', '',
  '[intl]', 'sCountry=United States', 'iCountry=1', 'iDate=0', 'iTime=0', 'sTime=:', 'sDate=/', 's1159=AM', 's2359=PM', '',
  '[ports]', 'LPT1:=', 'LPT2:=', 'COM1:=1200,n,8,1', 'COM2:=1200,n,8,1', '',
  '[colors]', 'Background=255 255 255', 'AppWorkspace=255 255 255', 'Window=255 255 255', 'WindowText=0 0 0',
  'Menu=255 255 255', 'MenuText=0 0 0', 'ActiveTitle=0 0 170', 'InactiveTitle=255 255 255', 'TitleText=255 255 255', '',
  '[devices]', 'Epson FX-80=EPSON,LPT1:',
])

const WIN_INI_2 = WIN_INI_1.replace('BorderWidth=5', 'BorderWidth=3').replace('Background=255 255 255', 'Background=0 170 170')

const WIN_INI_3 = crlf([
  '[windows]', 'load=', 'run=', 'Beep=yes', 'Spooler=yes', 'NullPort=None', 'device=HP LaserJet III,HPPCL5A,LPT1:',
  'BorderWidth=3', 'KeyboardSpeed=31', 'CursorBlinkRate=530', 'DoubleClickSpeed=452', 'Programs=com exe bat pif', 'Documents=',
  'DeviceNotSelectedTimeout=15', 'TransmissionRetryTimeout=45', 'swapdisk=', '',
  '[Desktop]', 'Pattern=(None)', 'Wallpaper=(None)', 'TileWallpaper=0', 'GridGranularity=0', 'IconSpacing=75', '',
  '[Extensions]', 'cal=calendar.exe ^.cal', 'crd=cardfile.exe ^.crd', 'trm=terminal.exe ^.trm', 'txt=notepad.exe ^.txt',
  'ini=notepad.exe ^.ini', 'pcx=pbrush.exe ^.pcx', 'bmp=pbrush.exe ^.bmp', 'wri=write.exe ^.wri', 'rec=recorder.exe ^.rec', 'hlp=winhelp.exe ^.hlp', '',
  '[intl]', 'sLanguage=enu', 'sCountry=United States', 'iCountry=1', 'iDate=0', 'iTime=0', 'iTLZero=0', 'iCurrency=0',
  'iCurrDigits=2', 'iNegCurr=0', 'iLzero=1', 'iDigits=2', 'iMeasure=1', 's1159=AM', 's2359=PM', 'sCurrency=$',
  'sThousand=,', 'sDecimal=.', 'sDate=/', 'sTime=:', 'sList=,', 'sShortDate=M/d/yy', 'sLongDate=dddd, MMMM dd, yyyy', '',
  '[ports]', 'LPT1:=', 'LPT2:=', 'LPT3:=', 'COM1:=9600,n,8,1,x', 'COM2:=9600,n,8,1,x', 'FILE:=', '',
  '[fonts]', 'Arial (TrueType)=ARIAL.FOT', 'Courier New (TrueType)=COUR.FOT', 'Times New Roman (TrueType)=TIMES.FOT',
  'Symbol (TrueType)=SYMBOL.FOT', 'Wingdings (TrueType)=WINGDING.FOT', 'MS Sans Serif 8,10,12,14,18,24 (VGA res)=SSERIFE.FON', '',
  '[colors]', 'Background=0 128 128', 'AppWorkspace=255 255 255', 'Window=255 255 255', 'WindowText=0 0 0', 'Menu=255 255 255',
  'MenuText=0 0 0', 'ActiveTitle=0 0 128', 'InactiveTitle=255 255 255', 'TitleText=255 255 255', 'ActiveBorder=192 192 192',
  'InactiveBorder=192 192 192', 'WindowFrame=0 0 0', 'Scrollbar=192 192 192', 'ButtonFace=192 192 192', 'ButtonShadow=128 128 128',
  'ButtonText=0 0 0', 'GrayText=128 128 128', 'Hilight=0 0 128', 'HilightText=255 255 255', '',
  '[patterns]', '(None)=(None)', 'Boxes=127 65 65 65 65 65 127 0', 'Paisley=2 7 7 2 32 80 80 32', 'Weave=136 84 34 69 136 21 34 81',
  'Waffle=0 0 0 0 128 128 128 240', 'Tulip=0 0 84 124 124 56 146 124', 'Spinner=20 12 200 121 158 19 48 40',
  'Scottie=64 192 200 120 120 72 0 0', 'Critters=0 80 114 32 0 5 39 2', '50% Gray=170 85 170 85 170 85 170 85',
  'Quilt=130 68 40 17 40 68 130 1', 'Diamonds=32 80 136 80 32 0 0 0', 'Thatches=248 116 34 71 143 23 34 113', 'Pattern=224 128 142 136 234 10 14 0', '',
  '[MS User Info]', 'DefName=Windows User', 'DefCompany=Personal Computing Inc.',
])

const SYSTEM_INI = crlf([
  '[boot]', 'shell=progman.exe', 'network.drv=', 'mouse.drv=mouse.drv', 'language.dll=', 'sound.drv=sound.drv',
  'comm.drv=comm.drv', 'keyboard.drv=keyboard.drv', 'system.drv=system.drv', 'display.drv=vga.drv',
  'fixedfon.fon=vgafix.fon', 'oemfonts.fon=vgaoem.fon', 'fonts.fon=vgasys.fon', '386grabber=vga.3gr', '',
  '[boot.description]', 'keyboard.typ=Enhanced 101 or 102 key US and Non US keyboards', 'mouse.drv=Microsoft, or IBM PS/2',
  'network.drv=No Network Installed', 'language.dll=English (American)', 'system.drv=MS-DOS System', 'display.drv=VGA', '',
  '[386Enh]', '32BitDiskAccess=OFF', 'device=*vpicd', 'device=*vtd', 'device=*reboot', 'device=*vdmad', 'device=*vsd',
  'device=*v86mmgr', 'device=*pageswap', 'device=*dosmgr', 'device=*vmpoll', 'device=*wshell', 'device=*BLOCKDEV',
  'device=*PAGEFILE', 'device=*vfd', 'device=*parity', 'device=*biosxlat', 'device=*vcd', 'device=*vmcpd', 'device=*combuff',
  'device=*cdpscsi', 'keyboard=*vkd', 'display=*vddvga', 'mouse=*vmd', 'MinTimeslice=20', 'WinTimeslice=100,50', 'WinExclusive=0',
  'Com1AutoAssign=2', 'PagingFile=C:\\WINDOWS\\WIN386.SWP', 'MaxPagingFileSize=8192', '',
  '[NonWindowsApp]', 'CommandEnvSize=1024',
])

const README: Record<Variant, string> = {
  win1: crlf([
    'README.TXT', '',
    'Welcome to Microsoft Windows Version 1.01.', '',
    'Windows is a graphical operating environment that runs on top of MS-DOS.',
    'Windows are tiled: when you start an application its window is placed next',
    'to the ones already open. Choose Zoom from a window\'s control menu to make it',
    'fill the screen, or Icon to shrink it into the icon area at the bottom.', '',
    'Using the MS-DOS Executive:',
    '  - Double-click a directory name to open it.',
    '  - Click a part of the path (C:\\WINDOWS) to go back up.',
    '  - Double-click an application (.EXE) to run it, or a .TXT file to open it',
    '    in Notepad.',
    '  - Try CLOCK.EXE, CALC.EXE, PAINT.EXE, REVERSI.EXE and NOTEPAD.EXE.', '',
    'To leave Windows, choose End Session from the Special menu.',
  ]),
  win2: crlf([
    'README.TXT', '',
    'Microsoft Windows Version 2.03', '',
    'New in this version: overlapping windows! Drag a window by its caption,',
    'resize it from its border, and use the boxes at the right of the caption bar',
    'to minimize or maximize it. Minimized applications appear as icons at the',
    'bottom of the screen; double-click an icon to restore it.', '',
    'The MS-DOS Executive lists the files in the current directory. Double-click',
    'a program to run it. Choose End Session from the Special menu to quit.',
  ]),
  win3: crlf([
    'README.TXT', '',
    'Microsoft Windows Version 3.1', '',
    'Program Manager organizes your applications into groups. Double-click an',
    'icon to start the application. Drag a group window by its title bar, or',
    'minimize it to an icon inside Program Manager.', '',
    'Tips',
    '  - File Manager shows the directory tree of drive C:.',
    '  - Use the Color and Desktop icons in Control Panel to change the color',
    '    scheme, the desktop color and the desktop pattern. Try "Hotdog Stand".',
    '  - Press Ctrl+Esc, or double-click the desktop, to open the Task List.',
    '  - Minesweeper is in the Games group.', '',
    'To quit, choose Exit Windows from the File menu in Program Manager.',
  ]),
}

const WIN_EXES: Record<Variant, string[]> = {
  win1: ['WIN.COM', 'WIN100.BIN', 'WIN100.OVL', 'MSDOS.EXE', 'NOTEPAD.EXE', 'CALC.EXE', 'PAINT.EXE', 'CLOCK.EXE', 'REVERSI.EXE',
    'WRITE.EXE', 'CARDFILE.EXE', 'CALENDAR.EXE', 'TERMINAL.EXE', 'CLIPBRD.EXE', 'CONTROL.EXE', 'SPOOLER.EXE', 'SYSTEM.DRV', 'DISPLAY.DRV'],
  win2: ['WIN.COM', 'WIN200.BIN', 'WIN200.OVL', 'MSDOS.EXE', 'NOTEPAD.EXE', 'CALC.EXE', 'PAINT.EXE', 'CLOCK.EXE', 'REVERSI.EXE',
    'WRITE.EXE', 'CARDFILE.EXE', 'CALENDAR.EXE', 'TERMINAL.EXE', 'CLIPBRD.EXE', 'CONTROL.EXE', 'SPOOLER.EXE', 'PIFEDIT.EXE', 'HIMEM.SYS'],
  win3: ['WIN.COM', 'PROGMAN.EXE', 'WINFILE.EXE', 'CONTROL.EXE', 'TASKMAN.EXE', 'NOTEPAD.EXE', 'CALC.EXE', 'PBRUSH.EXE', 'CLOCK.EXE',
    'WINMINE.EXE', 'SOL.EXE', 'WRITE.EXE', 'CARDFILE.EXE', 'CALENDAR.EXE', 'TERMINAL.EXE', 'RECORDER.EXE', 'CHARMAP.EXE',
    'PRINTMAN.EXE', 'CLIPBRD.EXE', 'SETUP.EXE', 'WINHELP.EXE', 'WINVER.EXE', 'HIMEM.SYS', 'EMM386.EXE', 'MAIN.GRP',
    'ACCESSOR.GRP', 'GAMES.GRP', 'STARTUP.GRP'],
}

const DOS_FILES: Record<Variant, string[]> = {
  win1: ['FORMAT.COM', 'CHKDSK.COM', 'EDLIN.COM', 'MODE.COM', 'DISKCOPY.COM', 'SYS.COM', 'MORE.COM'],
  win2: ['FORMAT.COM', 'CHKDSK.COM', 'EDLIN.COM', 'MODE.COM', 'DISKCOPY.COM', 'SYS.COM', 'MORE.COM', 'XCOPY.EXE', 'FDISK.COM'],
  win3: ['FORMAT.COM', 'CHKDSK.EXE', 'EDIT.COM', 'QBASIC.EXE', 'MEM.EXE', 'MODE.COM', 'DISKCOPY.COM', 'SYS.COM', 'MORE.COM',
    'XCOPY.EXE', 'FDISK.EXE', 'SMARTDRV.EXE', 'MOUSE.COM', 'SETVER.EXE', 'DOSKEY.COM', 'UNDELETE.EXE'],
}

/** A plausible DOS-era hard disk for each version. */
export function dosSeed(variant: Variant): FsSeed {
  const year = { win1: 1985, win2: 1987, win3: 1992 }[variant]
  return {
    'C:/COMMAND.COM': BIN,
    'C:/AUTOEXEC.BAT': AUTOEXEC[variant],
    'C:/CONFIG.SYS': CONFIG[variant],
    ...bins('C:/DOS', DOS_FILES[variant]),
    'C:/TEMP': null,
    ...bins('C:/WINDOWS', WIN_EXES[variant]),
    'C:/WINDOWS/WIN.INI': variant === 'win3' ? WIN_INI_3 : variant === 'win2' ? WIN_INI_2 : WIN_INI_1,
    'C:/WINDOWS/README.TXT': README[variant],
    ...(variant === 'win3'
      ? {
          'C:/WINDOWS/SYSTEM.INI': SYSTEM_INI,
          'C:/WINDOWS/PROGMAN.INI': crlf(['[Settings]', 'Window=60 28 565 388 1', 'SaveSettings=1', 'MinOnRun=0', 'AutoArrange=1', '',
            '[Groups]', 'Group1=C:\\WINDOWS\\MAIN.GRP', 'Group2=C:\\WINDOWS\\ACCESSOR.GRP', 'Group3=C:\\WINDOWS\\GAMES.GRP', 'Group4=C:\\WINDOWS\\STARTUP.GRP']),
          'C:/WINDOWS/CONTROL.INI': crlf(['[current]', 'color schemes=Windows Default', '', '[Screen Saver.Starfield Simulation]', 'Density=25', 'WarpSpeed=10']),
          ...bins('C:/WINDOWS/SYSTEM', ['KRNL386.EXE', 'USER.EXE', 'GDI.EXE', 'VGA.DRV', 'MOUSE.DRV', 'SOUND.DRV', 'KEYBOARD.DRV',
            'COMMDLG.DLL', 'MMSYSTEM.DLL', 'SHELL.DLL', 'VGASYS.FON', 'SSERIFE.FON', 'WIN386.EXE']),
          'C:/WINDOWS/TEMP': null,
        }
      : {}),
    'C:/LETTERS/MEMO.TXT': crlf([
      'MEMO', '', 'To:    All staff', 'From:  Accounting', `Date:  March 3, ${year}`, '',
      'Please remember to back up your work to floppy disk every Friday.',
      'Label each diskette with your name and the date.', '', 'Thank you.',
    ]),
    'C:/LETTERS/TODO.TXT': crlf(['- Buy more 5.25" diskettes', '- Ask IT about the 2400 baud modem', `- Upgrade to ${variant === 'win3' ? '8 MB' : '640 KB'} of RAM`, '- Finish quarterly report']),
  }
}
