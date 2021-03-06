import React, { useState, useEffect } from "react";
import {
	View,
	StyleSheet,
	AsyncStorage,
	TouchableOpacity,
	Alert,
} from "react-native";
import {
	Paragraph,
	Button,
	Text,
	Title,
	Divider,
	Caption,
} from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import * as Location from "expo-location";
import moment from "moment";
import { AntDesign, Entypo } from "@expo/vector-icons";

import { db } from "../src/config/db";

// const fetchLocation = () => {};

const DetailScreen = ({ navigation, route }) => {
	const { subjectCode } = route.params;
	const { dataMoment } = route.params;
	const { classCode } = route.params;
	const { nextPage } = route.params;
	const [location, setLocation] = useState(null);
	const [errorMsg, setErrorMsg] = useState(null);

	const [isOpen, setIsOpen] = useState();

	const [state, setState] = useState({
		year: "",
		month: "",
		day: "",
		timeMoment: "",
	});
	const { year, month, day, timeMoment } = state;

	useEffect(() => {
		(async () => {
			cutString();
			try {
				let temp = await AsyncStorage.getItem("stateCheckInStatus");
				if (temp === "isOpen") {
					setIsOpen(true);
				} else {
					setIsOpen(false);
				}
			} catch (error) {}
			let { status } = await Location.requestPermissionsAsync();
			if (status !== "granted") {
				setErrorMsg("Permission to access location was denied");
			}

			let location = await Location.getCurrentPositionAsync({});
			setLocation(location);
		})();
	}, []);

	let text = "Waiting..";
	if (errorMsg) {
		text = errorMsg;
	} else if (location) {
		text = JSON.stringify(location);
		// console.log(location);
	}

	const pushLocation = (location) => {
		db.ref("Teachers/phamtuan_mc/")
			.update({ location })
			.then((data) => {
				console.log("data -> Pushed to Firebase");
			})
			.catch((error) => {
				console.log("error", error);
			});
	};

	const cutString = async () => {
		// 2020-07-31
		let year_log = dataMoment;
		let month_log = dataMoment;
		let day_log = dataMoment;
		// console.log(moment().format("HH:mm:ss"));

		setState({
			year: year_log.substr(0, 4),
			month: month_log.substr(5, 2),
			day: day_log.substr(8, 2),
			timeMoment: moment().format("HH:mm:ss"),
		});
	};

	const _pushLog = (valueCheckIn) => {
		const data = dataMoment + " " + timeMoment + " --> " + valueCheckIn;
		db.ref("Subject/" + subjectCode + "/attendance/" + classCode + "/log/")
			.push(data)
			.then((data) => {
				// console.log("dataCheckIn -> pushed");
			})
			.catch((error) => {
				console.log("error", error);
			});
	};

	const _openAttendance = async () => {
		setIsOpen(true);
		pushLocation(location);
		const valueOpen = true;
		try {
			AsyncStorage.setItem("stateCheckInStatus", "isOpen");
			AsyncStorage.setItem("classLog", classCode);
			AsyncStorage.setItem("subjectLog", subjectCode);
			AsyncStorage.setItem("dateLog", dataMoment);
		} catch (error) {}
		db.ref("Subject/" + subjectCode + "/attendance/" + classCode + "/")
			.update({
				stateCheckIn: {
					dateOpen: dataMoment,
					timeOpen: timeMoment,
					valueOpen: valueOpen,
				},
			})
			.then((data) => {
				// console.log("dataCheckIn -> pushed");
			})
			.catch((error) => {
				console.log("error", error);
			});

		_pushLog(valueOpen);
	};

	const _closeAttendance = async () => {
		setIsOpen(false);
		const valueClose = false;
		try {
			AsyncStorage.setItem("stateCheckInStatus", "isClose");
			AsyncStorage.removeItem("classLog");
			AsyncStorage.removeItem("subjectLog");
			AsyncStorage.removeItem("dateLog");
		} catch (error) {}
		db.ref("Subject/" + subjectCode + "/attendance/" + classCode + "/")
			.update({
				stateCheckIn: {
					dateOpen: dataMoment,
					timeOpen: timeMoment,
					valueOpen: valueClose,
				},
			})
			.then((data) => {
				// console.log("dataCheckIn -> pushed");
			})
			.catch((error) => {
				console.log("error", error);
			});

		_pushLog(valueClose);
	};

	const _comingSoon = () => {
		Alert.alert("Thông báo", "Tính năng sẽ sớm được nâng cấp", [
			{
				text: "OK",
				onPress: () => console.log("on pressed"),
			},
		]);
	};

	// UiScreen
	return (
		<View style={styles.container}>
			<View
				style={{
					// paddingTop: Constants.statusBarHeight,
					paddingTop: 14,
					backgroundColor: "#f08a5d",
					paddingBottom: 18,
					borderBottomStartRadius: 24,
					borderBottomEndRadius: 24,
				}}
			>
				<TouchableOpacity
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "center",
					}}
				>
					{/* <Caption style={{ marginRight: 4 }}>Pull down to close</Caption> */}
					<Entypo name="chevron-down" size={24} color="#fff" />
				</TouchableOpacity>
				<Title
					style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
				>
					MỞ ĐIỂM DANH
				</Title>
			</View>
			{/* Top Screen */}
			<View style={styles.topScreen}>
				<Title>Chi tiết môn học đang giảng dạy</Title>
				<Divider style={{ marginHorizontal: 24, marginTop: 6 }} />
				<View style={styles.detailBlock}>
					<Caption>Mã môn</Caption>
					<Text>{subjectCode}</Text>
				</View>
				<View style={styles.detailBlock}>
					<Caption>Lớp học</Caption>
					<Text>{classCode}</Text>
				</View>
				<View style={styles.detailBlock}>
					<Caption>Ngày học</Caption>
					<Text>{dataMoment}</Text>
				</View>
				<View
					style={{
						display: "flex",
						flexDirection: "row",
					}}
				>
					{isOpen === true ? (
						<>
							<View style={styles.detailBlock}>
								<Caption>Trạng thái</Caption>
								<Text>Điểm danh đang mở</Text>
							</View>
							<View style={{ width: 20 }}></View>
							<View style={styles.detailBlock}>
								<Caption>Thời gian thực</Caption>
								<Text>{timeMoment}</Text>
							</View>
						</>
					) : (
						<>
							<View style={styles.detailBlock}>
								<Caption>Trạng thái</Caption>
								<Text>Điểm danh đang đóng</Text>
							</View>
						</>
					)}
				</View>
				<Button
					style={{ marginTop: 24 }}
					mode="text"
					color="#1E88E5"
					onPress={() => _comingSoon()}
				>
					Xem điểm danh
				</Button>
			</View>
			{/* Bottom Screen */}
			<View style={styles.bottomScreen}>
				{dataMoment == moment().format("YYYY-MM-DD") ? (
					isOpen === true ? (
						<Button
							style={{marginHorizontal: 20}}
							contentStyle={{ height: 54 }}
							mode="contained"
							color="#f08a5d"
							labelStyle={{color: "#fff"}}
							onPress={() => _closeAttendance()}
						>
							Đóng điểm danh
						</Button>
					) : (
						<Button
							style={{marginHorizontal: 20}}
							contentStyle={{ height: 54 }}
							mode="contained"
							color="#f08a5d"
							labelStyle={{color: "#fff"}}
							onPress={() => _openAttendance()}
						>
							Mở điểm danh
						</Button>
					)
				) : (
					<Caption style={{textAlign: "center"}}>Ngày điểm danh không phải hôm nay :)</Caption>
				)}
			</View>
			<Button
				style={{ marginHorizontal: 54, marginBottom: 42 }}
				mode="text"
				color="#dd2c00"
				onPress={() => navigation.goBack()}
			>
				Trở về
			</Button>
			<StatusBar style="dark" />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff"
	},
	topScreen: {
		flex: 0.6,
		paddingHorizontal: 12,
		paddingTop: 8,
	},
	bottomScreen: {
		flex: 0.4,
		paddingHorizontal: 8,
		display: "flex",
		justifyContent: "flex-end",
		// alignItems: "center",
		marginBottom: 54,
	},
	detailBlock: {
		marginVertical: 4,
	},
});

export default DetailScreen;
