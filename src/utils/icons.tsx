import React from 'react';
import FileTreeAlternativePlugin from 'main';
import { BiFolderPlus, BiFolder, BiFolderMinus, BiFile } from 'react-icons/bi';
import { ImFolder, ImFolderPlus, ImFolderMinus } from 'react-icons/im';
import { TiFolder, TiFolderOpen } from 'react-icons/ti';
import { CgCloseO, CgAdd, CgRemove } from 'react-icons/cg';
import { FaTimesCircle, FaThumbtack, FaArrowCircleLeft } from 'react-icons/fa';
import { AiFillFilePdf, AiFillFileImage, AiFillFileWord } from 'react-icons/ai';
import {
    IoIosSearch,
    IoIosEye,
    IoIosEyeOff,
    IoIosLocate,
    IoIosAddCircle,
    IoIosCloseCircleOutline,
    IoIosArrowBack,
    IoMdArrowDropright,
} from 'react-icons/io';
import { MdOutlineCreateNewFolder } from 'react-icons/md';
import { CgChevronDoubleDown, CgChevronDoubleUp, CgSortAz } from 'react-icons/cg';

const MinusSquareO = (props: any) => (
    <svg {...props} viewBox="64 -65 897 897">
        <g>
            <path
                d="M888 760v0v0v-753v0h-752v0v753v0h752zM888 832h-752q-30 0 -51 -21t-21 -51v-753q0 -29 21 -50.5t51 -21.5h753q29 0 50.5 21.5t21.5 50.5v753q0 30 -21.5 51t-51.5 21v0zM732 347h-442q-14 0 -25 10.5t-11 25.5v0q0 15 11 25.5t25 10.5h442q14 0 25 -10.5t11 -25.5v0
  q0 -15 -11 -25.5t-25 -10.5z"
            />
        </g>
    </svg>
);

const PlusSquareO = (props: any) => (
    <svg {...props} viewBox="64 -65 897 897">
        <g>
            <path
                d="M888 760v0v0v-753v0h-752v0v753v0h752zM888 832h-752q-30 0 -51 -21t-21 -51v-753q0 -29 21 -50.5t51 -21.5h753q29 0 50.5 21.5t21.5 50.5v753q0 30 -21.5 51t-51.5 21v0zM732 420h-184v183q0 15 -10.5 25.5t-25.5 10.5v0q-14 0 -25 -10.5t-11 -25.5v-183h-184
  q-15 0 -25.5 -11t-10.5 -25v0q0 -15 10.5 -25.5t25.5 -10.5h184v-183q0 -15 11 -25.5t25 -10.5v0q15 0 25.5 10.5t10.5 25.5v183h184q15 0 25.5 10.5t10.5 25.5v0q0 14 -10.5 25t-25.5 11z"
            />
        </g>
    </svg>
);

const EyeO = (props: any) => (
    <svg {...props} viewBox="61 51 902 666">
        <g>
            <path
                d="M963 384q0 14 -21 62q-26 65 -61 109q-57 71 -139 112q-99 50 -230 50t-231 -50q-80 -41 -138 -112q-34 -43 -61 -109q-21 -48 -21 -62v0v0v0v0q0 -14 21 -62q27 -66 61 -109q57 -71 139 -112q100 -50 230 -50t230 50q81 41 139 112q35 44 62 109q20 48 20 62v0v0v0v0z
  M889 384q-25 -77 -64 -126h-1q-46 -59 -114 -93q-85 -42 -198.5 -42t-198.5 42q-67 34 -114 93q-40 49 -65 126q25 77 65 126q47 59 114 93q85 43 199 43t198 -43q67 -33 114 -93q40 -49 65 -126zM512 558q-72 0 -122.5 -50.5t-50.5 -122.5t50.5 -122.5t122.5 -50.5
  t122.5 50.5t50.5 122.5t-50.5 122.5t-122.5 50.5zM614 385q0 -42 -30 -72t-72 -30t-72 30t-30 72t30 72t72 30t72 -30t30 -72z"
            />
        </g>
    </svg>
);

const CloseSquareO = (props: any) => (
    <svg {...props} viewBox="64 -65 897 897">
        <g>
            <path
                d="M717.5 589.5q-10.5 10.5 -25.5 10.5t-26 -10l-154 -155l-154 155q-11 10 -26 10t-25.5 -10.5t-10.5 -25.5t11 -25l154 -155l-154 -155q-11 -10 -11 -25t10.5 -25.5t25.5 -10.5t26 10l154 155l154 -155q11 -10 26 -10t25.5 10.5t10.5 25t-11 25.5l-154 155l154 155
  q11 10 11 25t-10.5 25.5zM888 760v0v0v-753v0h-752v0v753v0h752zM888 832h-752q-30 0 -51 -21t-21 -51v-753q0 -29 21 -50.5t51 -21.5h753q29 0 50.5 21.5t21.5 50.5v753q0 30 -21.5 51t-51.5 21v0z"
            />
        </g>
    </svg>
);

const LocationIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" stroke="currentColor" viewBox="0 0 50 50"><path d="M 24 0 L 24 1 L 24 4.0234375 C 13.208549 4.5309414 4.5329027 13.208443 4.0253906 24 L 1 24 L 0 24 L 0 26 L 1 26 L 4.0253906 26 C 4.5329027 36.791557 13.208549 45.469059 24 45.976562 L 24 49 L 24 50 L 26 50 L 26 49 L 26 45.974609 C 36.79155 45.467098 45.467098 36.79155 45.974609 26 L 49 26 L 50 26 L 50 24 L 49 24 L 45.974609 24 C 45.467098 13.20845 36.79155 4.5329024 26 4.0253906 L 26 1 L 26 0 L 24 0 z M 24 6.0488281 L 24 9 L 24 10 L 26 10 L 26 9 L 26 6.0507812 C 35.703044 6.5553041 43.444696 14.296956 43.949219 24 L 41 24 L 40 24 L 40 26 L 41 26 L 43.949219 26 C 43.444696 35.703044 35.703044 43.444696 26 43.949219 L 26 41 L 26 40 L 24 40 L 24 41 L 24 43.951172 C 14.298476 43.446281 6.5553046 35.703053 6.0507812 26 L 9 26 L 10 26 L 10 24 L 9 24 L 6.0507812 24 C 6.5553046 14.296947 14.298476 6.5537194 24 6.0488281 z M 19.990234 18.990234 A 1.0001 1.0001 0 0 0 19.292969 20.707031 L 23.585938 25 L 19.292969 29.292969 A 1.0001 1.0001 0 1 0 20.707031 30.707031 L 25 26.414062 L 29.292969 30.707031 A 1.0001 1.0001 0 1 0 30.707031 29.292969 L 26.414062 25 L 30.707031 20.707031 A 1.0001 1.0001 0 0 0 29.980469 18.990234 A 1.0001 1.0001 0 0 0 29.292969 19.292969 L 25 23.585938 L 20.707031 19.292969 A 1.0001 1.0001 0 0 0 19.990234 18.990234 z"/></svg>`;
const ZoomOutIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`;
const ZoomOutDoubleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 50 50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z M 13 12 L 13 18 L 15.28125 15.71875 L 19.5625 20 L 15.28125 24.28125 L 13 22 L 13 28 L 19 28 L 16.71875 25.71875 L 21 21.4375 L 25.28125 25.71875 L 23 28 L 29 28 L 29 22 L 26.71875 24.28125 L 22.4375 20 L 26.71875 15.71875 L 29 18 L 29 12 L 23 12 L 25.28125 14.28125 L 21 18.5625 L 16.71875 14.28125 L 19 12 Z"/></svg>`;
const ZoomInIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`;

export const getFolderIcon = (plugin: FileTreeAlternativePlugin, children: boolean, open: boolean) => {
    let setting = plugin.settings.folderIcon;

    let OpenFolderIcon = MinusSquareO;
    let InactiveOpenFolderIcon = CloseSquareO;
    let ClosedFolderIcon = PlusSquareO;

    if (setting === 'box-folder') {
        OpenFolderIcon = BiFolderMinus;
        InactiveOpenFolderIcon = BiFolder;
        ClosedFolderIcon = BiFolderPlus;
    } else if (setting === 'icomoon') {
        OpenFolderIcon = ImFolderMinus;
        InactiveOpenFolderIcon = ImFolder;
        ClosedFolderIcon = ImFolderPlus;
    } else if (setting === 'typicon') {
        OpenFolderIcon = TiFolderOpen;
        InactiveOpenFolderIcon = TiFolder;
        ClosedFolderIcon = TiFolder;
    } else if (setting === 'circle-gg') {
        OpenFolderIcon = CgRemove;
        InactiveOpenFolderIcon = CgCloseO;
        ClosedFolderIcon = CgAdd;
    }

    const Icon = children ? (open ? OpenFolderIcon : ClosedFolderIcon) : InactiveOpenFolderIcon;

    return Icon;
};

export {
    FaArrowCircleLeft,
    FaThumbtack,
    FaTimesCircle,
    LocationIcon,
    ZoomOutIcon,
    ZoomInIcon,
    ZoomOutDoubleIcon,
    IoIosSearch,
    IoIosEye,
    IoIosEyeOff,
    IoIosLocate,
    IoIosAddCircle,
    IoIosCloseCircleOutline,
    IoIosArrowBack,
    IoMdArrowDropright,
    CgChevronDoubleDown,
    CgChevronDoubleUp,
    CgSortAz,
    MdOutlineCreateNewFolder,
    BiFile,
    AiFillFilePdf,
    AiFillFileImage,
    AiFillFileWord,
};
