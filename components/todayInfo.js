import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, Caption, Title, Subheading, Divider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";

const todayInfo = (props) => {
	return (
		<TouchableOpacity style={styles.container} onPress={props.onPress}>
			<Caption style={{textAlign: "center", color: "#fff"}}>Today</Caption>
            <Divider style={{backgroundColor: "#fff"}}/>
			<View style={styles.rowCustom}>
				<Subheading style={{ fontSize: 24, color: "#fff", fontWeight: "bold" }}>
					{props.day}
				</Subheading>
				<Subheading style={{ color: "#fff" }}>{props.month}</Subheading>
			</View>
			<Text style={styles.textColor}>{props.weekDay}</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#f08a5d",
		position: "absolute",
		bottom: 12,
		left: 12,
        padding: 8,
        paddingTop: 4,
		borderRadius: 14,
		elevation: 4,
	},
	rowCustom: {
		display: "flex",
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "space-around",
		marginTop: 2,
	},
	textColor: {
        color: "#fff",
        textAlign: "right"
	},
});

export default todayInfo;
