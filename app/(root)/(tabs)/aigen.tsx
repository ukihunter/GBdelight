import { useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

  if (envBaseUrl) {
    return `${envBaseUrl}${normalizedPath}`;
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}${normalizedPath}`;
  }

  // For Expo Go on physical Android over USB, adb reverse maps localhost:8081.
  return `http://localhost:8081${normalizedPath}`;
};

const AIEvaluate = () => {
  const { user } = useUser();
  const [age, setAge] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [newFavorite, setNewFavorite] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [generatedDesign, setGeneratedDesign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Common favorites suggestions
  const favoritesSuggestions = [
    "Chocolate",
    "Vanilla",
    "Strawberry",
    "Caramel",
    "Fruit",
    "Floral",
    "Elegant",
    "Playful",
    "Minimalist",
    "Bold Colors",
    "Geometric",
    "Nature Theme",
  ];

  const toggleFavorite = (favorite: string) => {
    if (favorites.includes(favorite)) {
      setFavorites(favorites.filter((f) => f !== favorite));
    } else {
      setFavorites([...favorites, favorite]);
    }
  };

  const addCustomFavorite = () => {
    if (newFavorite.trim() && !favorites.includes(newFavorite)) {
      setFavorites([...favorites, newFavorite]);
      setNewFavorite("");
    }
  };

  const removeFavorite = (favorite: string) => {
    setFavorites(favorites.filter((f) => f !== favorite));
  };

  const handleGenerateDesign = async () => {
    if (!age.trim()) {
      alert("Please enter age");
      return;
    }
    if (favorites.length === 0) {
      alert("Please select at least one favorite/interest");
      return;
    }

    setIsLoading(true);
    try {
      // Call the AI cake design API
      const response = await fetch(getApiUrl("/ai-cake-design"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          age,
          favorites,
          notes: additionalNotes,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate design";
        try {
          const responseText = await response.text();
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = responseText.substring(0, 100) || errorMessage;
          }
        } catch {
          errorMessage = "Network error occurred";
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setGeneratedDesign({
          design: "AI Generated Cake Design",
          age,
          favorites,
          notes: additionalNotes,
          imageDataUrl: data.data.imageDataUrl,
          description: data.data.description,
          prompt: data.data.prompt,
        });
        setShowImageModal(true);
      } else {
        throw new Error(data.error || "Failed to generate design");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Generation error:", error);

      // Show helpful error messages
      if (
        errorMessage.includes("403") ||
        errorMessage.includes("Unauthorized")
      ) {
        alert(
          "Authentication failed. Please make sure you're logged in and try again.",
        );
      } else if (errorMessage.includes("503")) {
        alert(
          "AI service is temporarily busy. This can happen with free models. Try again in a few moments.",
        );
      } else if (errorMessage.includes("Model loading")) {
        alert(
          "AI model is loading for the first time. This may take 30-60 seconds. Please wait and try again.",
        );
      } else {
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCake = async () => {
    if (!generatedDesign?.imageDataUrl || !generatedDesign?.prompt) {
      alert("Generate a design first");
      return;
    }

    if (!user?.id) {
      alert("Please sign in before requesting a design");
      return;
    }

    setIsRequesting(true);
    try {
      const requestBody: Record<string, string> = {
        userId: user.id,
        prompt: generatedDesign.prompt,
        imageDataUrl: generatedDesign.imageDataUrl,
        description: generatedDesign.description,
      };

      if (additionalNotes.trim()) {
        requestBody.orderNotes = additionalNotes.trim();
      }

      const response = await fetch(getApiUrl("/request-ai-cake"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = "Failed to request cake";
        try {
          const responseText = await response.text();
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = responseText.substring(0, 100) || errorMessage;
          }
        } catch {
          errorMessage = "Network error occurred";
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to request cake");
      }

      alert(
        "Your cake design request has been sent successfully. Admin will review it soon.",
      );
      setShowImageModal(false);
      setAge("");
      setFavorites([]);
      setNewFavorite("");
      setAdditionalNotes("");
      setGeneratedDesign(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Error requesting cake: ${errorMessage}`);
      console.error("Request error:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="px-4 py-4 bg-white border-b border-pink-100">
        <View className="flex-row items-center mb-3">
          <MaterialCommunityIcons
            name="cake-variant"
            size={24}
            color="#ec4899"
          />
          <Text className="text-2xl font-JakartaExtraBold text-pink-600 ml-2">
            AI Cake Designer
          </Text>
        </View>
        <Text className="text-sm font-Jakarta text-gray-600">
          Create your perfect cake design with AI
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="p-4">
          {/* Age Section */}
          <View className="mb-6">
            <Text className="text-lg font-JakartaSemiBold text-gray-800 mb-3">
              1. What`s Your Age?
            </Text>
            <View className="bg-pink-50 rounded-2xl border border-pink-200 overflow-hidden">
              <TextInput
                placeholder="Enter your age"
                placeholderTextColor="#d946ef"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                className="px-4 py-3 text-base font-Jakarta text-gray-800"
                maxLength={3}
              />
            </View>
          </View>

          {/* Favorites Section */}
          <View className="mb-6">
            <Text className="text-lg font-JakartaSemiBold text-gray-800 mb-3">
              2. Your Favorites & Interests
            </Text>

            {favorites.length > 0 && (
              <View className="mb-4 bg-pink-100 rounded-2xl p-3">
                <View className="flex-row flex-wrap gap-2">
                  {favorites.map((fav) => (
                    <View
                      key={fav}
                      className="bg-pink-600 rounded-full px-3 py-2 flex-row items-center"
                    >
                      <Text className="text-white font-Jakarta text-sm mr-2">
                        {fav}
                      </Text>
                      <Pressable onPress={() => removeFavorite(fav)}>
                        <MaterialCommunityIcons
                          name="close"
                          size={16}
                          color="white"
                        />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View className="mb-4 bg-pink-50 rounded-2xl border border-pink-200 overflow-hidden flex-row">
              <TextInput
                placeholder="Add custom interest..."
                placeholderTextColor="#d946ef"
                value={newFavorite}
                onChangeText={setNewFavorite}
                className="flex-1 px-4 py-3 font-Jakarta text-gray-800"
              />
              <TouchableOpacity
                onPress={addCustomFavorite}
                className="px-4 py-3 bg-pink-600 items-center justify-center"
              >
                <MaterialCommunityIcons name="plus" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-Jakarta text-gray-600 mb-3">
              Select from suggestions:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {favoritesSuggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => toggleFavorite(suggestion)}
                  className={`px-4 py-2 rounded-full border-2 ${
                    favorites.includes(suggestion)
                      ? "bg-pink-600 border-pink-600"
                      : "bg-white border-pink-300"
                  }`}
                >
                  <Text
                    className={`font-Jakarta text-sm ${
                      favorites.includes(suggestion)
                        ? "text-white"
                        : "text-pink-600"
                    }`}
                  >
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Additional Notes Section */}
          <View className="mb-6">
            <Text className="text-lg font-JakartaSemiBold text-gray-800 mb-3">
              3. Any Additional Notes?
            </Text>
            <View className="bg-pink-50 rounded-2xl border border-pink-200 overflow-hidden">
              <TextInput
                placeholder="Tell us more about your dream cake... (e.g., specific colors, themes, special requests)"
                placeholderTextColor="#d946ef"
                value={additionalNotes}
                onChangeText={setAdditionalNotes}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                className="px-4 py-3 text-base font-Jakarta text-gray-800"
                maxLength={300}
              />
            </View>
            <Text className="text-xs font-Jakarta text-gray-500 mt-2">
              {additionalNotes.length}/300
            </Text>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            onPress={handleGenerateDesign}
            disabled={isLoading}
            className="bg-pink-600 rounded-2xl py-4 mb-20 flex-row items-center justify-center active:opacity-80 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="white" style={{ marginRight: 10 }} />
                <View>
                  <Text className="text-white text-lg font-JakartaExtraBold">
                    Creating Your Design...
                  </Text>
                  <Text className="text-pink-100 text-xs font-Jakarta">
                    This may take 30-60 seconds
                  </Text>
                </View>
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name="flash"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white text-lg font-JakartaExtraBold">
                  Generate My Design
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <View className="w-full max-w-md bg-white rounded-3xl p-5">
            <Text className="text-xl font-JakartaExtraBold text-gray-900 mb-2 text-center">
              Your Cake Design
            </Text>
            <Text className="text-sm font-Jakarta text-gray-600 mb-4 text-center">
              Here is the AI-generated image preview.
            </Text>

            {generatedDesign?.imageDataUrl ? (
              <Image
                source={{ uri: generatedDesign.imageDataUrl }}
                style={{
                  width: "100%",
                  height: 280,
                  borderRadius: 20,
                }}
                resizeMode="cover"
              />
            ) : (
              <View className="h-64 rounded-2xl bg-pink-100 items-center justify-center">
                <MaterialCommunityIcons
                  name="image"
                  size={48}
                  color="#ec4899"
                />
              </View>
            )}

            <TouchableOpacity
              onPress={handleRequestCake}
              disabled={isRequesting}
              className="mt-5 bg-pink-600 rounded-2xl py-4 items-center justify-center disabled:opacity-60"
            >
              {isRequesting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-JakartaExtraBold">
                  Request Design
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AIEvaluate;
