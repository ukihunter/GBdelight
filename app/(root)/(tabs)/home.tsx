import GoogleTextInput from "@/components/GoogleTextInput";

import { icons } from "@/constants";
import { useUser } from "@clerk/clerk-expo";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  Text,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

const recentHopin = [
  {
    ride_id: "1",
    origin_address: "Colombo, Sri Lanka",
    destination_address: "Kandy, Sri Lanka",
    origin_latitude: "6.927079",
    origin_longitude: "79.861244",
    destination_latitude: "7.290572",
    destination_longitude: "80.633728",
    ride_time: 180,
    fare_price: "9500.00",
    payment_status: "paid",
    driver_id: 2,
    user_id: "1",
    created_at: "2024-08-12 05:19:20.620007",
    driver: {
      driver_id: "2",
      first_name: "Sanjeewa",
      last_name: "Perera",
      profile_image_url:
        "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
      car_image_url:
        "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
      car_seats: 5,
      rating: "4.60",
    },
  },
  {
    ride_id: "2",
    origin_address: "Jaffna, Sri Lanka",
    destination_address: "Colombo, Sri Lanka",
    origin_latitude: "9.661498",
    origin_longitude: "80.025513",
    destination_latitude: "6.927079",
    destination_longitude: "79.861244",
    ride_time: 520,
    fare_price: "20500.00",
    payment_status: "paid",
    driver_id: 1,
    user_id: "1",
    created_at: "2024-08-12 06:12:17.683046",
    driver: {
      driver_id: "1",
      first_name: "Nuwan",
      last_name: "Fernando",
      profile_image_url:
        "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
      car_image_url:
        "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
      car_seats: 4,
      rating: "4.80",
    },
  },
  {
    ride_id: "3",
    origin_address: "Galle, Sri Lanka",
    destination_address: "Matara, Sri Lanka",
    origin_latitude: "6.053519",
    origin_longitude: "80.220978",
    destination_latitude: "5.954920",
    destination_longitude: "80.555000",
    ride_time: 70,
    fare_price: "3500.00",
    payment_status: "paid",
    driver_id: 1,
    user_id: "1",
    created_at: "2024-08-12 08:49:01.809053",
    driver: {
      driver_id: "1",
      first_name: "Nuwan",
      last_name: "Fernando",
      profile_image_url:
        "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
      car_image_url:
        "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
      car_seats: 4,
      rating: "4.80",
    },
  },
  {
    ride_id: "4",
    origin_address: "Negombo, Sri Lanka",
    destination_address: "Colombo, Sri Lanka",
    origin_latitude: "7.200800",
    origin_longitude: "79.873700",
    destination_latitude: "6.927079",
    destination_longitude: "79.861244",
    ride_time: 45,
    fare_price: "2500.00",
    payment_status: "paid",
    driver_id: 3,
    user_id: "1",
    created_at: "2024-08-12 18:43:54.297838",
    driver: {
      driver_id: "3",
      first_name: "Kasun",
      last_name: "Jayasinghe",
      profile_image_url:
        "https://ucarecdn.com/0330d85c-232e-4c30-bd04-e5e4d0e3d688/-/preview/826x822/",
      car_image_url:
        "https://ucarecdn.com/289764fb-55b6-4427-b1d1-f655987b4a14/-/preview/930x932/",
      car_seats: 4,
      rating: "4.70",
    },
  },
];

const Home = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { isLoaded, isSignedIn, user } = useUser();
  const handleDestinationPress = () => {
    console.log("Destination input pressed");
    // Implement navigation or other logic here
  };
  const width = Dimensions.get("window").width;
  const ads = [
    { id: 1, image: require("../../../assets/add/add1.png") }, // local image
    { id: 2, image: require("../../../assets/add/add2.jpg") }, // remote image
    { id: 3, image: require("../../../assets/add/add3.png") }, // remote image
  ];

  const loading = false;
  return (
    <>
      <StatusBar hidden />

      <SafeAreaView style={{ flex: 1 }} className="bg-[#fcf1f1]">
        <Image
          source={require("../../../assets/icons/image.png")}
          style={{
            width: "100%",
            height: 90,
            resizeMode: "cover",
            zIndex: -1,
            position: "absolute",
            top: 0,
          }}
        />
        <FlatList
          data={[]} // Provide an empty array if you only want to show the header for now
          renderItem={null} // No items to render
          ListHeaderComponent={
            <>
              <Text
                style={{
                  color: "black",
                  fontSize: 20,
                  padding: 20,
                  marginTop: 45,
                  fontWeight: "bold",
                }}
              >
                Hello{" "}
                {isLoaded && isSignedIn && user?.username
                  ? user.username
                  : "Guest"}{" "}
              </Text>
              <GoogleTextInput
                icon={icons.search}
                placeholder="Search for your cravings !!"
                containerStyle="mx-3  bg-[#d6d4d4] mb-2   shadow-md shadow-neutral-300 "
                handlePress={handleDestinationPress}
              />

              <View style={{ paddingHorizontal: 20 }}>
                <Carousel
                  loop
                  width={width}
                  height={200}
                  autoPlay={true}
                  autoPlayInterval={3000}
                  data={ads}
                  scrollAnimationDuration={1000}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#eee",
                        marginVertical: 50,
                        height: 90,
                        width: width - 60,
                        marginRight: 30,
                      }}
                    >
                      <Image
                        source={
                          typeof item.image === "string"
                            ? { uri: item.image }
                            : item.image
                        }
                        style={{
                          width: width - 40,
                          height: 180,
                          resizeMode: "cover",
                          borderRadius: 10,
                        }}
                      />
                    </View>
                  )}
                />

                <Text className="text-l font-JakartaBold mt-2 ml-2 mb-2">
                  Category
                </Text>
                <View className="flex-row flex-wrap justify-between">
                  {/*cake slice*/}
                  <View className="bg-[#c07171] rounded-full p-4 shadow-black shadow-lg">
                    <Image
                      source={require("../../../assets/category/cake-slice.png")}
                      style={{ width: 30, height: 30 }}
                    />
                  </View>
                  {/*cake*/}
                  <View className="bg-[#c09171] rounded-full p-4">
                    <Image
                      source={require("../../../assets/category/cake.png")}
                      style={{ width: 30, height: 30 }}
                    />
                  </View>
                  {/*cookies*/}
                  <View className="bg-[#abc071] rounded-full p-4">
                    <Image
                      source={require("../../../assets/category/cookies.png")}
                      style={{ width: 30, height: 30 }}
                    />
                  </View>
                  {/*cupcake*/}
                  <View className="bg-[#c0ae71] rounded-full p-4">
                    <Image
                      source={require("../../../assets/category/muffin.png")}
                      style={{ width: 30, height: 30 }}
                    />
                  </View>
                </View>
              </View>
            </>
          }
        />
      </SafeAreaView>
    </>
  );
};

export default Home;

// const { signOut } = useClerk();

//  const handleSignOut = async () => {
//    try {
//     await signOut();
// Redirect to your desired page
// router.push("/(auth)/sign-in");
//    } catch (err) {
// See https://clerk.com/docs/custom-flows/error-handling
// for more info on error handling
//    console.error(JSON.stringify(err, null, 2));
///    }
// };

// Example user object; replace with actual user data from your auth provider
