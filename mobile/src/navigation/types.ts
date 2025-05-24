import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: undefined;
  NotFound: undefined;
};

// Type for useNavigation hook in screens
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Type for navigation props in screens
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = {
  navigation: {
    navigate: (screen: keyof AuthStackParamList, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: AuthStackParamList[T];
  };
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = {
  navigation: {
    navigate: (screen: keyof MainTabParamList, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: MainTabParamList[T];
  };
};
