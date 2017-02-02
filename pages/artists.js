import Page from '../js/page'

export default (new Page({
	'id': 'Artists',
	'view': 'list',
	'groupby': 'alpha',
	'sortby': 'label',
	'icon': () => 'img/icons/default/DefaultMusicArtists.png',
	'parentState': state => ({ 'page': 'Menu', 'media': 'Music' }),
	'data': function (state) {
		const filter = xbmc.makeFilter(state, [
			{ name: 'Genre', key: 'genre', type: String }
		])

		let group = state['group'] || this.groupby

		return xbmc.get({
			'method': 'AudioLibrary.GetArtists',
			'params': { 
				'properties': [ 'thumbnail' ]
				//'albumartistsonly': true
			},
			'cache': true
		})
		.then(result => ({
			pageName: 'Artists' + (
				filter ? ' by ' + filter.name : 
				group ? ' by '+group :
				''),
			title: filter ? ''+filter.value : undefined,
			items: (result.artists || []).map(artist => ({
				alpha: artist.label[0].toUpperCase(),
				label: artist.label,
				link: '#page=Artist&artistid='+artist.artistid,
				thumbnail: artist.thumbnail ? xbmc.vfs2uri(artist.thumbnail) : 'img/icons/default/DefaultArtist.png',
				play: () => xbmc.Play({ 'artistid': "+x.artistid+" }, 0)
			}))
		}))
	}
}));