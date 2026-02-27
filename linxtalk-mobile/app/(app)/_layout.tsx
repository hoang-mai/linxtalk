import {TabList, TabSlot, TabTrigger, Tabs} from 'expo-router/ui';
import {TabButton} from '@/components/app/layouts/TabButton';
import {Colors} from "@/constants/theme";

export default function AppLayout() {
    return (
        <Tabs>
            <TabSlot/>
            <TabList className="flex-row justify-center items-center rounded-full border mb-4" style={{
                borderColor: Colors.grey["200"],
                marginHorizontal: 64,
                backgroundColor: "white",
                shadowColor: Colors.grey["100"],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                elevation: 2,
            }}>
                <TabTrigger name="index" href="/" asChild>
                    <TabButton icon="chatbubbles-outline">Messages</TabButton>
                </TabTrigger>
                <TabTrigger name="friends/index" href="/friends" asChild>
                    <TabButton icon="people-outline">Friends</TabButton>
                </TabTrigger>
                <TabTrigger name="settings/index" href="/settings" asChild>
                    <TabButton icon="settings-outline">Settings</TabButton>
                </TabTrigger>
            </TabList>
        </Tabs>
    );
}
