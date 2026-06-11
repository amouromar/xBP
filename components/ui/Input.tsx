import React, { forwardRef, useState } from "react";
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useAppTheme } from "@/providers/ThemeProvider";

type Props = TextInputProps & {
  containerStyle?: ViewStyle;
};

export const Input = forwardRef<TextInput, Props>(
  ({ style, containerStyle, ...props }, ref) => {
    const { colors } = useAppTheme();
    const [focused, setFocused] = useState(false);

    return (
      <View
        style={[
          styles.container,
          {
            borderColor: focused ? colors.primary : colors.border,
            backgroundColor: colors.surface,
          },
          containerStyle,
        ]}
      >
        <TextInput
          ref={ref}
          {...props}
          placeholderTextColor={colors.textSecondary}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              color: colors.text,
              fontFamily: "BricolageGrotesque",
            },
            style,
          ]}
        />
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  input: {
    fontSize: 16,
    paddingVertical: 4,
  },
});