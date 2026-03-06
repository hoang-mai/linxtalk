import { BlurView, BlurTargetView } from "expo-blur";
import { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import Button from "@/library/Button";
import Icon from "@/library/Icon";
import { LinearGradient } from "expo-linear-gradient";


export default function Main() {
  const blurTargetRef = useRef<View | null>(null);

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, marginHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-center text-grey-900 dark:text-grey-100">Friends</Text>
        <Pressable className="flex-row items-center justify-start gap-2 p-4 bg-white dark:bg-background-dark rounded-full border border-grey-200 dark:border-grey-800 my-4">
          <Icon name="search-outline" size={24} color={Colors.grey["400"]} darkColor={Colors.grey["200"]} />
          <Text className="text-grey-500 dark:text-grey-400">Search Friends...</Text>
        </Pressable>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <Text className="text-xl font-bold">Requests</Text>
            <View className="w-8 h-8 flex items-center justify-center bg-primary-400 rounded-full ">
              <Text className="text-lg text-white font-bold">3</Text>
            </View>
          </View>
          <Text className="text-primary-500 font-medium">See All</Text>
        </View>

        <View className="relative mt-4 overflow-hidden rounded-2xl">
          <BlurTargetView
            ref={blurTargetRef}
            style={{
              ...({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const),
            }}
          >
            <LinearGradient
              colors={[Colors.primary["500"], Colors.primary["100"]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 96,
                height: 96,
                borderRadius: 999,
                position: 'absolute',
                top: -20,
                right: -20,
                opacity: 1,
              }}
            />
          </BlurTargetView>

          <BlurView
            blurTarget={blurTargetRef}
            intensity={50}
            tint="light"
            blurMethod="dimezisBlurView"
            className="p-5 w-full"
          >
            <View className="flex-row items-center gap-4 mb-4">
              <View className="w-14 h-14 rounded-full bg-grey-200 overflow-hidden" />
              <View>
                <Text className="text-lg font-bold text-grey-900">Hoàng Mai</Text>
                <Text className="text-grey-500">2 mutual friends</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button
                  title="Confirm"
                  onPress={() => { }}
                />
              </View>
              <View className="flex-1">
                <Button
                  variant="outline"
                  title="Delete"
                  onPress={() => { }}
                />
              </View>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}