export interface EventObject {
	type: string;
}

type Disposal = () => void;

type Invoker = ({
	send,
}: {
	send: (event: EventObject) => void;
}) => Disposal | undefined;

export function assign(
	fn: ({ context, event }: { context: any; event: EventObject }) => any
) {
	return {
		type: "assign",
		assignment: fn,
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
					actions?: ReturnType<typeof assign>;
				};
			};
		};
	};
}

interface StateObject<T> {
	value: string;
	context: T;
}

export interface Machine<T> {
	transition: (
		[currentState]: [StateObject<T>, Invoker | undefined],
		event: EventObject
	) => [StateObject<T>, Invoker | undefined];
	initialState: [StateObject<T>, Invoker | undefined];
}

export function createMachine<T>(config: StateMachineConfig<T>): Machine<T> {
	return {
		transition: ([currentState], event) => {
			const stateConfig = config.states[currentState.value];
			const transition = stateConfig.on?.[event.type];
			const nextStateValue = transition?.target ?? currentState.value;
			const nextStateConfig = config.states[nextStateValue];
			const nextContext =
				transition?.actions?.type === "assign"
					? transition?.actions?.assignment({
							context: currentState.context,
							event,
					  })
					: currentState.context;

			return [
				{ value: nextStateValue, context: nextContext },
				nextStateConfig.invoke,
			];
		},
		initialState: [
			{ value: config.initial, context: config.context },
			config.states[config.initial].invoke,
		],
	};
}
