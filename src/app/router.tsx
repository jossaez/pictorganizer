import { Route, Routes } from 'react-router-dom';
import { BootRedirect } from './BootRedirect';
import { CreateActivityPage } from '@/features/activities/pages/CreateActivityPage';
import { EditActivityPage } from '@/features/activities/pages/EditActivityPage';
import { AdultRouteGuard } from '@/features/adult-mode/components/AdultRouteGuard';
import { AdultDashboardPage } from '@/features/adult-mode/pages/AdultDashboardPage';
import { AdultUnlockPage } from '@/features/adult-mode/pages/AdultUnlockPage';
import { AdultModeLayout } from '@/features/adult-mode/layout/AdultModeLayout';
import { AgendaPage } from '@/features/agenda/pages/AgendaPage';
import { AdultOnlyGuard } from '@/features/child-mode/components/AdultOnlyGuard';
import { ChildModeLayout } from '@/features/child-mode/layout/ChildModeLayout';
import { ChildDayPage } from '@/features/child-mode/pages/ChildDayPage';
import { ChildHomePage } from '@/features/child-mode/pages/ChildHomePage';
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage';
import { CreateProfilePage } from '@/features/profiles/pages/CreateProfilePage';
import { EditProfilePage } from '@/features/profiles/pages/EditProfilePage';
import { ProfileSelectionPage } from '@/features/profiles/pages/ProfileSelectionPage';
import { ProgressPage } from '@/features/progress/pages/ProgressPage';
import { RoutinesPage } from '@/features/routines/pages/RoutinesPage';
import { RoutineTemplateDetailPage } from '@/features/routines/pages/RoutineTemplateDetailPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { DiagnosticsPage } from '@/features/settings/pages/DiagnosticsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<BootRedirect />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/adult/unlock" element={<AdultUnlockPage />} />

      <Route element={<ChildModeLayout />}>
        <Route path="/child" element={<ChildHomePage />} />
        <Route path="/child/day" element={<ChildDayPage />} />
      </Route>

      <Route element={<AdultRouteGuard />}>
        <Route path="/profiles" element={<ProfileSelectionPage />} />
        <Route path="/profiles/new" element={<CreateProfilePage />} />
        <Route
          path="/profiles/:profileId/edit"
          element={
            <AdultOnlyGuard>
              <EditProfilePage />
            </AdultOnlyGuard>
          }
        />
        <Route
          path="/activities/new"
          element={
            <AdultOnlyGuard>
              <CreateActivityPage />
            </AdultOnlyGuard>
          }
        />
        <Route
          path="/activities/:instanceId/edit"
          element={
            <AdultOnlyGuard>
              <EditActivityPage />
            </AdultOnlyGuard>
          }
        />

        <Route element={<AdultModeLayout />}>
          <Route path="/adult" element={<AdultDashboardPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/routines/:routineTemplateId" element={<RoutineTemplateDetailPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/diagnostics" element={<DiagnosticsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
