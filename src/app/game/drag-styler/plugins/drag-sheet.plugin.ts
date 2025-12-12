import {BaseStylerPlugin} from "@src/app/game/drag-styler/plugins/base";
import {CSSProperties} from "react";

export class DragSheetPlugin extends BaseStylerPlugin {
    protected sheet: HTMLDivElement;

    protected defaultStyles: Partial<{
        cursor: CSSProperties['cursor']
    }> = {}

    constructor(node: Element) {
        super(node);
    }

    initImpl() {
        const node = this.node as HTMLElement;
        const tagName = node.tagName.toLowerCase();
        const missTags = ['canvas', 'img'];
        if (missTags.includes(tagName)) return false;
        this.defaultStyles.cursor = node.style.cursor;


        const sheet = this.sheet = document.createElement('div');
        const style = sheet.style;
        style.position = 'fixed';
        style.inset = '0';
        style.cursor = 'grabbing';
        style.zIndex = '9999';
        style.visibility = 'hidden';
        style.pointerEvents = 'all';

        this.node.appendChild(sheet);
        return true;
    }

    onFirstDrag() {
        this.sheet.style.visibility = 'visible';
        this.sheet.style.cursor = 'grabbing';
    }

    onStop() {
        this.sheet.style.visibility = 'hidden';
        this.sheet.style.cursor = this.defaultStyles.cursor!;
    }

    disposeImpl() {
        this.node = null as any;
        this.sheet.remove();
    }
}