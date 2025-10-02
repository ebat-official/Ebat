import StarWidget from "./components/starWidget";

function App() {
  return (
    <div className="container flex items-center justify-center w-screen h-screen">
      <StarWidget
        changeHandler={(val) => {
          console.log(val);
        }}
        selectedVal={5}
      />
    </div>
  );
}

export default App;
