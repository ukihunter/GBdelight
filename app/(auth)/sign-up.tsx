import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useSignUp } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";

const Signup = () => {
  const [showsuccessModal, setshowsuccessModal] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();
  const [Form, Setform] = useState({
    name: "",
    email: "",
    password: "",
    // confirmPassword: "",
  });

  const [verification, setverification] = useState({
    state: "default", // "pending" | "success" | "failed"
    error: "",
    code: "",
    sessionId: null as string | null,
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    //  if (Form.password !== Form.confirmPassword) {
    //  alert("Passwords do not match!");
    // return;
    //}

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        username: Form.name,
        emailAddress: Form.email,
        password: Form.password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setverification((prev) => ({ ...prev, state: "pending" }));
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      // console.error(JSON.stringify(err, null, 2));
      if (typeof err === "object" && err !== null && "errors" in err) {
        // @ts-ignore
        alert(err.errors?.[0]?.message || "An error occurred");
      } else {
        alert("An error occurred");
      }
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    // Validate verification code
    if (!verification.code.trim()) {
      setverification((prev) => ({
        ...prev,
        error: "Please enter the verification code",
        state: "failed",
      }));
      return;
    }

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.code.trim(),
      });

      if (signUpAttempt.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: Form.name,
            email: Form.email,
            clerkId: signUpAttempt.createdUserId,
          }),
        });

        setverification((prev) => ({
          ...prev,
          state: "success",
          error: "",
          sessionId: signUpAttempt.createdSessionId,
        }));

        // Show success modal immediately
        setshowsuccessModal(true);
      } else {
        setverification((prev) => ({
          ...prev,
          error: "Verification failed. Please check your code and try again.",
          state: "failed",
        }));
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      let errorMessage = "Verification failed";

      if (err.errors && err.errors.length > 0) {
        errorMessage =
          err.errors[0].longMessage || err.errors[0].message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setverification((prev) => ({
        ...prev,
        error: errorMessage,
        state: "failed",
      }));
    }
  };

  //if (verification.state === "pending") {
  //  return (
  //  <>
  //  <Text>Verify your email</Text>
  //{verification.error ? (
  //        <Text style={{ color: "red", marginBottom: 8 }}>
  //        {verification.error}
  //     </Text>
  // ) : null}
  //  <TextInput
  //  value={verification.cord}
  // onChangeText={(cord) => setverification({ ...verification, cord })}
  //placeholder="Enter your verification code"
  ///>
  ///    <TouchableOpacity onPress={onVerifyPress}>
  //    <Text>Verify</Text>
  // </TouchableOpacity>
  // </>
  /// );
  /// }
  return (
    <ScrollView className="flex-1 bg-[#ffffff] ">
      <View className="flex-1 bg-white">
        {verification.error ? (
          <Text style={{ color: "red", marginBottom: 8 }}>
            {verification.error}
          </Text>
        ) : null}
        <View className="relative w-full h-[250px] ">
          <Image
            source={images.signupbanner}
            className="z-0 w-full h-[250] mb-10"
          />
          <Text className="text-3xl text-[#924c1d] font-JakartaBold absolute-bottom-1 justify-center  text-center">
            Lets make Delight!!
          </Text>
          <View className="p-2  ">
            <InputField
              label="Username"
              icon={icons.person}
              placeholder="Enter Your username"
              value={Form.name}
              onChangeText={(value) =>
                Setform((prev) => ({ ...prev, name: value }))
              }
            />
            <InputField
              label="Email"
              icon={icons.email}
              placeholder="Enter Your Email"
              value={Form.email}
              onChangeText={(value) =>
                Setform((prev) => ({ ...prev, email: value }))
              }
            />
            <InputField
              label="Password"
              icon={icons.lock}
              placeholder="Enter Your Password"
              value={Form.password}
              secureTextEntry={true}
              onChangeText={(value) =>
                Setform((prev) => ({ ...prev, password: value }))
              }
            />
          </View>
          <CustomButton
            title="Signup"
            className="p-3 bg-[#924c1d] text-white"
            onPress={onSignUpPress}
          />
          {/*   <OAuth />
         google auth*/}
          <View className="flex-row text-center justify-center text-lg">
            <Text className="text-gray"> Already have an account? </Text>
            <Link href="/(auth)/sign-in">
              <Text className="text-[#924c1d]">Log in </Text>
            </Link>
          </View>
        </View>

        <ReactNativeModal isVisible={verification.state === "pending"}>
          <View className="bg-white rounded-3xl min-h-[300px]  px-8 py-9 ">
            <Text className="text-2xl font-JakartaBold mb-2">Verification</Text>
            <Text className="text-gray-400 mb-5">
              Verification code has been sent to your email address {Form.email}
            </Text>
            <View className="w-full">
              <InputField
                label="Verification Code"
                icon={icons.lock}
                placeholder="Enter your verification code"
                keyboardType="numeric"
                value={verification.code}
                onChangeText={(code) =>
                  setverification((prev) => ({ ...prev, code }))
                }
              />
              {verification.error && (
                <Text className="text-red-500 mt-2">{verification.error}</Text>
              )}
            </View>
            <CustomButton
              title="Verify"
              className="p-3 mt-5  bg-orange-500"
              onPress={onVerifyPress}
            />
            <CustomButton
              title="Resend Code"
              className="p-3 mt-3 bg-gray-500"
              onPress={async () => {
                if (!signUp) return;
                try {
                  await signUp.prepareEmailAddressVerification({
                    strategy: "email_code",
                  });
                  setverification((prev) => ({ ...prev, error: "", code: "" }));
                } catch {
                  setverification((prev) => ({
                    ...prev,
                    error: "Failed to resend code. Please try again.",
                  }));
                }
              }}
            />
          </View>
        </ReactNativeModal>

        <ReactNativeModal isVisible={showsuccessModal}>
          <View className="bg-white px-10 rounded-3xl min-h-[350px] items-center justify-center">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5 "
            />
            <Text className="text-center text-lg mb-10 font-JakartaBold">
              Your account has been created successfully!
            </Text>
            <CustomButton
              title="Let's Hop In"
              className="p-3 w-full "
              onPress={async () => {
                if (verification.sessionId && setActive) {
                  await setActive({ session: verification.sessionId });
                }
                setshowsuccessModal(false);
                // The auth layout will handle the redirect now
              }}
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default Signup;
