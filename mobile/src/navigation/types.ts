import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Admin: undefined;
};

export type AdminStackParamList = {
  AdminHome: undefined;
  UserManagement: undefined;
  AddUser: undefined;
  EditUser: { userId: string };
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: undefined;
  Admin: NavigatorScreenParams<AdminStackParamList>;
  NotFound: undefined;
};

// Type for useNavigation hook in screens
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Type for navigation props in screens
type BaseScreenProps<T extends Record<string, object | undefined>> = {
  navigation: {
    navigate: (screen: keyof T, params?: any) => void;
    goBack: () => void;
    setOptions: (options: any) => void;
  };
  route: {
    params: T[keyof T];
  };
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = BaseScreenProps<{
  [K in T]: AuthStackParamList[K];
}>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BaseScreenProps<{
  [K in T]: MainTabParamList[K];
}>;

export type AdminStackScreenProps<T extends keyof AdminStackParamList> = BaseScreenProps<{
  [K in T]: AdminStackParamList[K];
}>;
