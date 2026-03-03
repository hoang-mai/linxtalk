import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { TabButton } from '@/components/app/layouts/TabButton';
import { Colors } from "@/constants/theme";
import { useSegments } from 'expo-router';
import { useTranslation } from 'react-i18next';
export default function AppLayout() {
    const segments = useSegments();
    const { t } = useTranslation();

    const isChildScreen = segments.length > 2;
    return (
        <Tabs>
            <TabSlot />
            <TabList className="absolute bottom-2 left-0 right-0 flex-row justify-center items-center rounded-full border" style={{
                borderColor: Colors.grey["200"],
                marginHorizontal: 64,
                backgroundColor: "white",
                shadowColor: Colors.grey["100"],
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                elevation: 2,
                display: isChildScreen ? "none" : "flex",
            }}>
                <TabTrigger name="index" href="/" asChild>
                    <TabButton icon="chatbubbles-outline">{t('tabs.messages')}</TabButton>
                </TabTrigger>
                <TabTrigger name="friends/index" href="/friends" asChild>
                    <TabButton icon="people-outline">{t('tabs.friends')}</TabButton>
                </TabTrigger>
                <TabTrigger name="settings/index" href="/settings" asChild>
                    <TabButton icon="settings-outline">{t('tabs.settings')}</TabButton>
                </TabTrigger>
            </TabList>
        </Tabs>
    );
}
