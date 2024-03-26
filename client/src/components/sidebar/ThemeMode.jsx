import { useContext } from "react";
import { LightPrefer } from "../App";
import { FaMoon, FaSun } from "react-icons/fa";

const ThemeMode = () => {
  const { lightPrefer, setLightPrefer } = useContext(LightPrefer);

  const handleModeToggle = () => {
    if (lightPrefer === "dark") {
      setLightPrefer("light");
      localStorage.setItem("theme", "light");
      document.body.classList.remove("dark");
    } else {
      setLightPrefer("dark");
      localStorage.setItem("theme", "dark");
      document.body.classList.add("dark");
    }
  };

  return (
    <div
      className={`w-8 h-8 rounded-full flex justify-center items-center cursor-pointer dark:bg-lightWhite bg-gray-300`}
      onClick={handleModeToggle}
    >
      {lightPrefer === "dark" ? <FaMoon /> : <FaSun />}
    </div>
  );
};

export default ThemeMode;
