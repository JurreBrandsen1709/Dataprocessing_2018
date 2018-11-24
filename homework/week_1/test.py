from pattern.web import URL, DOM, plaintext
 
url = URL('http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series')
dom = DOM(url.download())

# Loop through the list of movies
for item in dom('div.lister-item-content'):
	
	# Get the runtime
	for runtime in item.by_tag('span.runtime'):
		print runtime.content.strip(' min')