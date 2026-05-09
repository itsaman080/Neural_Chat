import ChatContainer from "./components/ChatContainer.jsx";

/**
 * App — root component.
 * Keeps the tree shallow; ChatContainer owns all chat state.
 */
export default function App() {
  return <ChatContainer />;
}
