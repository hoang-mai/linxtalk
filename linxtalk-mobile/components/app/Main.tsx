import {View,Text, ScrollView} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Main(){
  return (
    <SafeAreaView>
      <ScrollView>
        <Text>Home</Text>
      </ScrollView>
    </SafeAreaView>
  );
}