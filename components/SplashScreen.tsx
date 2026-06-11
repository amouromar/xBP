import React from "react";
import { Image, View } from "react-native";

type Props = {
  backgroundColor: string;
};

export function SplashScreen({ backgroundColor }: Props) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={require("../assets/images/res/mipmap-xhdpi/ic_launcher_monochrome.png")}
        style={{
          width: 150,
          height: 150,
        }}
        resizeMode="contain"
      />
    </View>
  );
}