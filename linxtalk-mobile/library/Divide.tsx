import {View} from "react-native";

interface DivideProps {
  vertical?: boolean;
  className?: string;
}

export default function Divide({vertical = false, className = ""}: DivideProps) {
  return (
    <View
      className={`${vertical ? "w-px self-stretch" : "h-px w-full"} bg-grey-200 ${className}`}
    />
  );
}
