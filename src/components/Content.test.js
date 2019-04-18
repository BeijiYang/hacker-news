import React from 'react'
import Content from './Content'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import axios from 'axios'

jest.mock('axios')

Enzyme.configure({ adapter: new Adapter() })

describe('<Content />', () => {
	const storyIds = {
		status: 200,
		data: new Array(500)
	}
	axios.get.mockImplementation(() => Promise.resolve(storyIds))

	it('render a content', async () => {
		const renderedComponent = await shallow(<Content />)
		const content = renderedComponent.find('.content')
		expect(content).toHaveLength(1)
	})

	it('sets the state componentDidMount', async () => {
		const renderedComponent = await shallow(<Content />)
		await renderedComponent.update()
		expect(axios.get).toHaveBeenCalled()
		expect(renderedComponent.state('storyIds').length).toEqual(500)
	})
})
