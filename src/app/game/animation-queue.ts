export class AnimationQueue {
    queue: Function[] = []
    rafId: number | undefined

    push(f: Function) {
        if (!this.queue.length) {
            this.rafId = requestAnimationFrame(() => {
                this.rafId = undefined
                this.run()
            })
        }

        this.queue.push(f)
    }

    private run() {
        const queue = this.queue
        this.queue = []
        queue.forEach(f => f())
    }

    dispose() {
        this.queue = []
        this.rafId && window.cancelAnimationFrame(this.rafId)
    }
}