import { hashArrayToURL } from './hash'

export default class {
	
	constructor(obj) {
		//copy obj.* to this.*
		for (let attr in obj)
            if (obj.hasOwnProperty(attr))
            	this[attr] = obj[attr];
	}

	crumbs(state, pages) {
		if (this.parentState === undefined) return []

		const parentState = this.parentState(state)
		const parentPage = pages.getById(parentState['page'])
		if (!parentPage) return []

		const crumbs = parentPage.crumbs(parentState, pages)
		if (parentPage.icon) crumbs.push({
			'label': parentPage['id'],
			'icon': parentPage.icon(parentState),
			'link': hashArrayToURL(parentState)
		})
		return crumbs
	}

	render(state, pages) {
		let $loading = document.getElementById('loading')
		$loading.className = ''
		let $content = document.getElementById('content')
		$content.className = 'hidden'

		const page = this
		return page.data(state)   //get the page data
		.then(data => {
			data.crumbs = page.crumbs(state, pages)
			data.crumbs.push({
				'icon': page.icon ? page.icon(state) : undefined,
				'label': data.pageName || page.name || page.id,
				'link': hashArrayToURL(state)
			})
			return data
		})
		.then(data => {

			//sort and group the data
			//TODO: review and probably rewrite

			function groupItems (items, groupby) {
				const o = [], groups = {}

				if (!(items[0] && items[0][groupby])) return items
					
				items.forEach((item, i) => {
					const key = item[groupby]
					if (groups[key] === undefined) groups[key] = []
					groups[key].push(item)
				})

				Object.getOwnPropertyNames(groups).forEach(key => {
					o.unshift({
						'label': key,
						'items': groups[key]
					})
				})

				return o
			}

			function sortItems (items, sortby) {
				if (!(items[0] && items[0][sortby])) return items
				return items.sort(function (a, b) {
					let x = a[sortby], y = b[sortby]
					if (x < y) return -1
					if (x > y) return +1
					return 0
				})
			}
			
			//if (state['sort') || this.sortby) data.items = sortItems(data.items, state['sort'] || this.sortby]
			
			const groupbyKey = state['group'] || this.groupby
			const groupbyValue = state[groupbyKey]
			if (groupbyKey) {
				if (!Array.isArray(data.items)) data.items = []
				const size = data.items.length
				const showItems = !(!groupbyValue && size > advancedSettings.pages.groupingThreshold)

				//sort and group the items
				data.items = sortItems(groupItems(data.items, groupbyKey), 'label')

				//create groups
				if (size > advancedSettings.pages.groupingThreshold)
					data.groups = data.items.map(x => {
						const s = Object.assign({}, state)
						s[groupbyKey] = x.label
						return {
							'label': x.label,
							'link': hashArrayToURL(s),
							'selected': x.label === groupbyValue
						}
					})

				//filter
				if (groupbyValue)
					data.items = data.items.filter(x => x.label === groupbyValue)

				//don't show the full list
				if (!showItems)
					data.items = undefined

			}

			return data


		})
		.catch(error => {
			console.error(error)
			return {
				title: 'Error getting page data',
				subtitle: error.message || '',
				pageName: ':('
			}
		})
		.then(data => {
			//render the data to the DOM via the template
			data.id = this.id;
			//document.title = ''+(data.title ? data.title : 'Kodi');

			let $page = document.createElement('div')
			$page.setAttribute('class', 'page')

			//copy key/value pairs from the URL to the data- attributes of the $page
			Object.keys(state).forEach(key => $page.setAttribute('data-'+key, state[key]))
			$page.setAttribute('data-page', this.id) //make sure the home page has a data-page attribute

			$page.innerHTML = templates[ state['view'] || this.view ](data)

			let $content = document.getElementById('content')
			while ($content.firstChild) $content.removeChild($content.firstChild)  // $content.removeAllChildElements()
			$content.className = ''

			let $loading = document.getElementById('loading')
			$loading.className = 'hidden'

			$content.appendChild($page)

			$page

		})



			
	}
}