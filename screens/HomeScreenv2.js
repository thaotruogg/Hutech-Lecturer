import React, { Component } from "react";
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	AsyncStorage,
	Image,
	Alert,
} from "react-native";
import CalendarStrip from "react-native-calendar-strip";
import { Divider, Caption } from "react-native-paper";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";

import { db } from "../src/config/db";
import moment from "moment";

import Card from "../components/Card";
import ErrorItem from "../components/ErrorItem";

let date = "";
let customDatesStyles = [];
let markedDates = [];

let get;
let dateData = [];
let temp;
let searchTrue;
// let isOpenUI;
class HomeScreen extends Component {
	async componentDidMount() {
		let mssv = await AsyncStorage.getItem("username");
		const isOpenUI = await AsyncStorage.getItem("stateCheckInStatus");
		this.setState({isOpenUI: isOpenUI})
		this.setState({ mssv: mssv });
		setTimeout(() => {
			this.fetch();
		}, 2000);
		this.fetch();
		return;
	}

	fetch = async () => {
		this.state.markedDates = [];
		dateData = [];
		this.setState({ isLoading: true });
		try {
			db.ref("Teachers/" + this.state.mssv + "/schedule/").on(
				"value",
				(Snapshot) => {
					get = Snapshot.val();
					Snapshot.forEach((element) => {
						dateData.push(element.child("date").val());
					});
				}
			);
		} catch (error) {}
		this.setState({
			day: dateData,
		});
		this.setState({
			sbjList: get,
		});
		this.setState({ isLoading: false });
	};

	constructor(props) {
		super(props);

		let startDate = moment(); // today

		// Create a week's worth of custom date styles and marked dates.

		this.state = {
			selectedDate: moment().format("YYYY-MM-DD"),
			customDatesStyles,
			markedDates,
			startDate,
			day: [],
			sbjList: [],
			isLoading: false,
			list: [],
			isOpenUI: ""
		};
	}

	onDateSelected = (date) => {
		this.setState({ formattedDate: date.format("YYYY-MM-DD") });
	};

	func = () => {
		if (this.state.day.length != 0 || this.state.day != null) {
			for (let i = 0; i < this.state.day.length; i++) {
				const element = this.state.day[i];
				date = element;

				let dots = [];

				if (date) {
					dots.push({
						color: "red",
						selectedColor: "green",
					});
				}

				this.state.markedDates.push({
					date,
					dots,
				});
			}
		}
	};

	searchBinary = (arr, search) => {
		for (let i = 0; i < arr.length; i++) {
			const element = arr[i];
			if (element === search) {
				return i;
			}
		}
		return -1;
	};

	lastUpdate = () => {
		let { sbjList } = this.state;
		searchTrue = this.searchBinary(dateData, this.state.formattedDate);
		try {
			if (searchTrue != -1) {
				if (get.length != 0) {
					for (let i = 0; i < get.length; i++) {
						let element = get[i];
						temp = Object.values(element);
						if (this.state.formattedDate === temp[0]) {
							this.state.list = temp[1];
						}
					}
				}
			} else {
				//
			}
		} catch (error) {
			// console.log(error);
		}
	};

	actionNavigate = async (item) => {
		try {
			const isOpen = await AsyncStorage.getItem("stateCheckInStatus");
			let classIsOpen = await AsyncStorage.getItem("classLog");
			let dateIsOpen = await AsyncStorage.getItem("dateLog");
			let subjectIsOpen = await AsyncStorage.getItem("subjectLog");
			let boo = await AsyncStorage.getItem("nextPage");
			if (boo == "isTrue") {
				if (isOpen == "isOpen") {
					if (
						classIsOpen == item.class &&
						dateIsOpen == this.state.formattedDate &&
						subjectIsOpen == item.subjectId
					) {
						this.props.navigation.navigate("Detail", {
							subjectCode: item.subjectId,
							dataMoment: this.state.formattedDate,
							classCode: item.class,
							nextPage: boo,
						});
					}
					else {
						Alert.alert(
							"Thông báo",
							"Bạn cần đống điểm danh trước khi mở 1 điểm danh khác",
							[
								{
									text: "OK",
									onPress: () => console.log("on pressed"),
								},
							]
						);
					}
				} else {
					this.props.navigation.navigate("Detail", {
						subjectCode: item.subjectId,
						dataMoment: this.state.formattedDate,
						classCode: item.class,
						nextPage: boo,
					});
				}
			} else {
			}
		} catch (error) {}
	};

	renderRow = ({ item, index }) => {
		return <Card timeTable={item} onPress={() => this.actionNavigate(item)} />;
	};

	render() {
		this.func();
		this.lastUpdate();

		return (
			<View style={styles.container}>
				<View>
					<CalendarStrip
						scrollable
						selectedDate={this.state.selectedDate}
						calendarAnimation={{ type: "parallel", duration: 20 }}
						daySelectionAnimation={{
							type: "background",
							duration: 100,
							highlightColor: "#f6ab6c",
						}}
						style={{
							height: 132,
							paddingTop: Constants.statusBarHeight + 8,
							paddingBottom: 8,
							borderBottomEndRadius: 34,
							borderBottomStartRadius: 34,
						}}
						calendarHeaderStyle={{ color: "white" }}
						calendarColor={"#f08a5d"}
						dateNumberStyle={{ color: "white" }}
						dateNameStyle={{ color: "white" }}
						iconContainer={{ flex: 0.12 }}
						customDatesStyles={this.state.customDatesStyles}
						markedDates={this.state.markedDates}
						datesBlacklist={this.datesBlacklistFunc}
						onDateSelected={this.onDateSelected}
						useIsoWeekday={true}
					/>
					<Caption style={{ textAlign: "center", marginTop: 8 }}>
						Ứng dụng dành cho giảng viên
					</Caption>
				</View>

				{searchTrue != -1 ? (
					<FlatList
						style={{ marginVertical: 6 }}
						data={this.state.list}
						renderItem={this.renderRow}
						keyExtractor={(i, k) => k.toString()}
						refreshing={this.state.isLoading}
						onRefresh={this.fetch}
					/>
				) : (
					<View
						style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
					>
						<Image
							style={{ width: 120, height: 120 }}
							source={require("../assets/calendar/calendar-1.png")}
						/>
						<Text style={{ marginTop: 8, fontWeight: "bold" }}>
							OOPS...! Không có lịch
						</Text>
					</View>
				)}

				<StatusBar style="auto" />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
	},
});

export default HomeScreen;
