const clearActionQueueSymbol = Symbol();

export function clearActionQueue() {
	return {
		type: clearActionQueueSymbol,
	} as const;
}

interface EventObject {
	type: string;
}

type Disposal = () => void;

type Invoker = ({
	send,
}: {
	send: (event: EventObject) => void;
}) => Disposal | undefined;

type Action = ({ context, event }: { context: any; event: EventObject }) => any;

interface ActionWrapper {
	type: "action" | "assign";
	action: Action;
}

export function action(fn: Action) {
	return {
		type: "action",
		action: fn,
	} as const;
}

export function assign(fn: Action) {
	return {
		type: "assign",
		action: fn,
	} as const;
}

interface StateMachineConfig<T> {
	initial: string;
	context: T;
	states: {
		[key: string]: {
			invoke?: Invoker;
			on?: {
				[key: string]: {
					target?: string;
					actions?: ActionWrapper[];
				};
			};
		};
	};
}

interface StateObject<T> {
	value: string;
	context: T;
}

interface CurrentState<T> {
	state: StateObject<T>;
	actionQueue: Array<() => void>;
	invoker?: Invoker;
}

export interface Machine<T> {
	transition: (
		value: CurrentState<T>,
		event: EventObject | ReturnType<typeof clearActionQueue>
	) => CurrentState<T>;
	initialState: CurrentState<T>;
}

export function createMachine<T>(config: StateMachineConfig<T>): Machine<T> {
	return {
		transition: (currentState, event) => {
			if (event.type === clearActionQueueSymbol) {
				return {
					state: currentState.state,
					actionQueue: [],
					invoker: currentState.invoker,
				};
			}

			const stateConfig = config.states[currentState.state.value];
			const transition = stateConfig.on?.[event.type];
			const nextStateValue = transition?.target ?? currentState.state.value;
			const nextStateConfig = config.states[nextStateValue];
			const nextActionQueue: Array<() => void> = [...currentState.actionQueue];
			let context = currentState.state.context;

			if (transition?.actions) {
				for (const actionWrapper of transition.actions) {
					if (actionWrapper.type === "assign") {
						context = actionWrapper.action({
							context,
							event,
						});
					} else {
						nextActionQueue.push(() =>
							actionWrapper.action({ context, event })
						);
					}
				}
			}

			return {
				state: { value: nextStateValue, context },
				actionQueue: nextActionQueue,
				invoker: nextStateConfig.invoke,
			};
		},
		initialState: {
			state: { value: config.initial, context: config.context },
			actionQueue: [],
			invoker: config.states[config.initial].invoke,
		},
	};
}
