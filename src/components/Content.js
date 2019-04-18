import React, { Component } from 'react'
import Grid from './Grid'
import axios from 'axios'


const storiesUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json'

class Content extends Component {
	constructor(props) {
		super(props)
		this.state = {
			storyIds: [],
		}
	}

	componentDidMount() {
		this.fetchTopStories()
			.then(data => { this.setState({ storyIds: data }) })
	}

	fetchTopStories() {
		return axios.get(storiesUrl).then(res => res.data)
	}

	render() {
		const grids = this.state.storyIds.map((id) => {
			return (<Grid
				id="grid"
				key={id}
			/>)
		})
		return (
			<div className="content">
				{grids}
			</div>
		)
	}
}

export default Content