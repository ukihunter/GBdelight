export type SignupProps = {
  Form: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  Setform: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }>
  >;
  onSignUpPress: () => void;
};
