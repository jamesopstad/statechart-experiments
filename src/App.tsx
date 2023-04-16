import { assign, createMachine } from "./createMachine";
import { useMachine } from "./useMachine";

const timerMachine = createMachine({
	initial: "inactive",
	context: {
		count: 0,
	},
	states: {
		inactive: {
			on: {
				start: { target: "active" },
				reset: {
					actions: assign(({ context }) => ({
						...context,
						count: 0,
					})),
				},
			},
		},
		active: {
			invoke: ({ send }) => {
				const i = setInterval(() => {
					send({ type: "tick" });
				}, 1000);

				return () => {
					clearInterval(i);
				};
			},
			on: {
				stop: { target: "inactive" },
				tick: {
					actions: assign(({ context }) => ({
						...context,
						count: context.count + 1,
					})),
				},
			},
		},
	},
});

export function App() {
	const { state, send, isPending } = useMachine(timerMachine);

	console.log(state);

	return (
		<div className="App">
			<h2>State: {state.value}</h2>
			<h2>Count: {state.context.count}</h2>
			<h2>isPending: {isPending ? "true" : "false"}</h2>
			<button
				onClick={() => send({ type: "start" })}
				disabled={state.value !== "inactive"}
			>
				Start
			</button>
			<button
				onClick={() => send({ type: "stop" })}
				disabled={state.value !== "active"}
			>
				Stop
			</button>
			<button
				onClick={() => send({ type: "reset" })}
				disabled={state.value !== "inactive"}
			>
				Reset
			</button>
		</div>
	);
}
