import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import Button from "@/library/Button";
import Icon from "@/library/Icon";
import {useRouter} from "expo-router";


export default function Main() {
    const router = useRouter();
  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, marginHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-center text-grey-900 dark:text-grey-100">Friends</Text>
        <Pressable onPress={()=> router.push("/friends/search-friends")} className="flex-row items-center justify-start gap-2 p-4 bg-white dark:bg-background-dark rounded-full border border-grey-200 dark:border-grey-800 my-4">
          <Icon name="search-outline" size={24} color={Colors.grey["400"]} darkColor={Colors.grey["200"]} />
          <Text className="text-grey-500 dark:text-grey-400">Search Friends...</Text>
        </Pressable>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <Text className="text-xl font-bold dark:text-white">Requests</Text>
            <View className="w-8 h-8 flex items-center justify-center bg-primary-400 rounded-full ">
              <Text className="text-lg text-white font-bold">3</Text>
            </View>
          </View>
          <Text className="text-primary-500 font-medium">See All</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -20 }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
          className="mt-4"
        >
          {/* Thẻ 1 */}
          <View className="bg-white dark:bg-background-dark p-5 rounded-2xl border border-grey-200 dark:border-grey-800 w-[300px]">
              <View className="flex-row items-center gap-4 mb-4">
                <View className="w-14 h-14 rounded-full bg-grey-200 overflow-hidden"/>
                <View>
                  <Text className="text-lg font-bold text-grey-900 dark:text-grey-100">Hoàng Mai</Text>
                  <Text className="text-grey-500 dark:text-grey-400">2 mutual friends</Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button
                      title="Confirm"
                      onPress={() => {
                      }}
                  />
                </View>
                <View className="flex-1">
                  <Button
                      variant="outline"
                      title="Delete"
                      onPress={() => {
                      }}
                  />
                </View>
              </View>
          </View>

          {/* Thẻ 2 */}
          <View className="bg-white dark:bg-background-dark p-5 rounded-2xl border border-grey-200 dark:border-grey-800 w-[300px]">
              <View className="flex-row items-center gap-4 mb-4">
                <View className="w-14 h-14 rounded-full bg-grey-200 overflow-hidden"/>
                <View>
                  <Text className="text-lg font-bold text-grey-900 dark:text-grey-100">Nam Nguyen</Text>
                  <Text className="text-grey-500 dark:text-grey-400">5 mutual friends</Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button
                      title="Confirm"
                      onPress={() => {
                      }}
                  />
                </View>
                <View className="flex-1">
                  <Button
                      variant="outline"
                      title="Delete"
                      onPress={() => {
                      }}
                  />
                </View>
              </View>
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}