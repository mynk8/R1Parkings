import { CarScene } from "./components/CarScene";
import "./styles.css"; // Import the new CSS file

export default function App() {
  return (
    <main>
      <div className="car-scene-container">
        <CarScene />
      </div>
      <div className="heading">
        <div className="bg-primary ">Need</div>
        <div className="bg-primary">parking?</div>
      </div>
    </main>
  );
}
