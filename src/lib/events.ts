

export const events = {
  "user.isUnauthenticated": "user.isUnauthenticated",
  "axios.makeRequest": "axios.makeRequest",
} as const


export type UnsubscribeCallback = () => void

export type Event = typeof events[keyof typeof events]

export class EventBridge {
  private  subscribers: Map<Event, Function[]> = new Map();

  subscribe(event: Event, callback: Function):UnsubscribeCallback {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, [])
    }

    this.subscribers.get(event)?.push(callback)

    return () => this.unsubscribe(event, callback)
  }


  unsubscribe(event: Event, callback: Function) {
    if (!this.subscribers.has(event)) {
      return
    }
    this.subscribers.set(
      event,
      this.subscribers.get(event)?.filter((cb) => cb !== callback) || [],
    )
  }

  emit(event: Event, ...args: any[]) {
    if (!this.subscribers.has(event)) {
      return
    }
    console.log(`Event emitted: ${event} to ${this.subscribers.get(event)?.length} subscribers`)

    this.subscribers.get(event)?.forEach((cb) => cb(...args))
  }

  private static instance: EventBridge;

  static getInstance(): EventBridge {
    if(!EventBridge.instance) {
      EventBridge.instance = new EventBridge()
    }

    return EventBridge.instance
  }
}


export const eventBridge = EventBridge.getInstance()
