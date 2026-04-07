import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AIEvaluate = () => {
  const [activeTab, setActiveTab] = useState<"generate" | "preview">(
    "generate",
  );
  const [age, setAge] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [newFavorite, setNewFavorite] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [generatedDesign, setGeneratedDesign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      // TODO: Replace with actual API call to your backend
      // const response = await fetch('/api/generate-cake-design', {
      //   method: 'POST',
      //   body: JSON.stringify({ age, favorites, notes: additionalNotes })
      // });
      // const data = await response.json();

      // Mock generated design for now
      setTimeout(() => {
        setGeneratedDesign({
          design: "AI Generated Cake Design",
          age,
          favorites,
          notes: additionalNotes,
          timestamp: new Date(),
        });
        setActiveTab("preview");
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      alert("Error generating design");
      setIsLoading(false);
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

      {/* Tab Navigation */}
      <View className="flex-row bg-pink-50 border-b border-pink-200">
        <Pressable
          onPress={() => setActiveTab("generate")}
          className={`flex-1 py-4 border-b-2 flex-row items-center justify-center ${
            activeTab === "generate"
              ? "border-pink-600 bg-white"
              : "border-transparent"
          }`}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={18}
            color={activeTab === "generate" ? "#ec4899" : "#9ca3af"}
            style={{ marginRight: 8 }}
          />
          <Text
            className={`font-JakartaSemiBold ${
              activeTab === "generate"
                ? "text-pink-600 text-base"
                : "text-gray-500 text-sm"
            }`}
          >
            Generate Cake
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("preview")}
          disabled={!generatedDesign}
          className={`flex-1 py-4 border-b-2 flex-row items-center justify-center ${
            activeTab === "preview"
              ? "border-pink-600 bg-white"
              : "border-transparent"
          } ${!generatedDesign ? "opacity-50" : ""}`}
        >
          <MaterialCommunityIcons
            name="eye"
            size={18}
            color={activeTab === "preview" ? "#ec4899" : "#9ca3af"}
            style={{ marginRight: 8 }}
          />
          <Text
            className={`font-JakartaSemiBold ${
              activeTab === "preview"
                ? "text-pink-600 text-base"
                : "text-gray-500 text-sm"
            }`}
          >
            Your Design
          </Text>
        </Pressable>
      </View>

      {/* Content Area */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {activeTab === "generate" ? (
          // Generate Tab
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

              {/* Selected Favorites */}
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

              {/* Custom Input */}
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

              {/* Suggestions Grid */}
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
                  <ActivityIndicator
                    color="white"
                    style={{ marginRight: 10 }}
                  />
                  <Text className="text-white text-lg font-JakartaExtraBold">
                    Generating...
                  </Text>
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
        ) : (
          // Preview Tab
          <View className="p-4">
            {generatedDesign && (
              <>
                <View className="bg-gradient-to-b from-pink-50 to-pink-100 rounded-3xl p-6 mb-6 shadow">
                  {/* Placeholder for AI Generated Image */}
                  <View className="bg-pink-200 rounded-2xl h-64 items-center justify-center mb-6">
                    <MaterialCommunityIcons
                      name="image"
                      size={48}
                      color="#ec4899"
                      style={{ marginBottom: 12 }}
                    />
                    <Text className="text-gray-700 font-JakartaSemiBold text-center">
                      Your AI Generated Cake Design
                    </Text>
                    <Text className="text-gray-500 font-Jakarta text-sm mt-2 text-center">
                      (Image will be displayed here)
                    </Text>
                  </View>

                  {/* Design Details */}
                  <View className="bg-white rounded-2xl p-4 mb-4">
                    <Text className="text-lg font-JakartaSemiBold text-gray-800 mb-4">
                      Design Details
                    </Text>

                    <View className="mb-4 pb-4 border-b border-pink-200">
                      <Text className="text-sm font-Jakarta text-gray-600 mb-1">
                        Age
                      </Text>
                      <Text className="text-base font-JakartaSemiBold text-pink-600">
                        {generatedDesign.age} years old
                      </Text>
                    </View>

                    <View className="mb-4 pb-4 border-b border-pink-200">
                      <Text className="text-sm font-Jakarta text-gray-600 mb-2">
                        Favorites & Interests
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {generatedDesign.favorites.map((fav: string) => (
                          <View
                            key={fav}
                            className="bg-pink-100 rounded-full px-3 py-1"
                          >
                            <Text className="text-sm font-Jakarta text-pink-700">
                              {fav}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {generatedDesign.notes && (
                      <View>
                        <Text className="text-sm font-Jakarta text-gray-600 mb-1">
                          Additional Notes
                        </Text>
                        <Text className="text-base font-Jakarta text-gray-700">
                          {generatedDesign.notes}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-3">
                    <TouchableOpacity className="flex-1 bg-pink-600 rounded-xl py-3 active:opacity-80 flex-row items-center justify-center">
                      <MaterialCommunityIcons
                        name="content-save"
                        size={18}
                        color="white"
                        style={{ marginRight: 6 }}
                      />
                      <Text className="text-white text-center font-JakartaSemiBold">
                        Save Design
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-pink-100 rounded-xl py-3 active:opacity-80 flex-row items-center justify-center">
                      <MaterialCommunityIcons
                        name="share-variant"
                        size={18}
                        color="#ec4899"
                        style={{ marginRight: 6 }}
                      />
                      <Text className="text-pink-600 text-center font-JakartaSemiBold">
                        Share
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Generate Another Button */}
                <TouchableOpacity
                  onPress={() => {
                    setActiveTab("generate");
                  }}
                  className="bg-white border-2 border-pink-600 rounded-2xl py-3 flex-row items-center justify-center active:opacity-80"
                >
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={18}
                    color="#ec4899"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-pink-600 text-center font-JakartaSemiBold text-base">
                    Generate Another Design
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AIEvaluate;
