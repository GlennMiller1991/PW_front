import {PromiseConfiguration} from "@fbltd/async";

export class FontCSSLoader {
    protected cache: Map<string, {
        link?: HTMLLinkElement,
        promise?: PromiseConfiguration<void>
    }> = new Map();

    load(family: string, url: string) {
        if (this.cache.has(family)) {
            return this.cache.get(family)?.promise?.promise ?? Promise.resolve();
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);

        const p = new PromiseConfiguration<void>();

        this.cache.set(family, {
            link,
            promise: p,
        });

        const entry = this.cache.get(family)!;

        document.fonts.ready.then((fs) => {
            const fsArr = Array
                .from(fs)
                .filter(f => f.family === family);

            fsArr.forEach(f => f.load());

            Promise
                .all(fsArr.map(f => f.loaded))
                .then(() => p.resolve())
                .catch(() => {
                    this.cache.delete(family);
                    p.reject(new Error("load was unsuccessful"));
                })
                .finally(() => {
                    link.remove();
                    entry.link = undefined;
                    entry.promise = undefined;
                })
            ;

        })

        return p.promise;
    }

    dispose() {
        for (let [, {promise, link}] of this.cache.entries()) {
            promise?.reject(new Error('dispose'));
            link?.remove();
        }

        this.cache.clear();
    }


}