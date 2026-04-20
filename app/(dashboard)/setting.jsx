import { StyleSheet, Text, View } from 'react-native'
import { Link } from "expo-router"
import React from 'react'


const setting = () => {
    return (
        <View>
            <Link href={"../debugger"}> debugger</Link>
            <Text>setting</Text>
        </View>
    )
}

export default setting

const styles = StyleSheet.create({})