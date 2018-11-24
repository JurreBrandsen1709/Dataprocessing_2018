#!/usr/bin/env python
# Name: Jurre Brandsen
# Student number: 11808918

'''
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
'''
import csv
from pattern.web import URL, DOM, plaintext, encode_utf8, strip_tags

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'
TOP = 50


def extract_tvseries(dom):
    '''
    This function will extract the title, rating, genre, actor(s) and the runtime of a serie.
    strip_tags and encode_utf8 are both used to pretty-print the output.
    '''

    # Create empty lists.
    serieTitle = []
    serieRating = []
    serieGenre = []
    serieStars = []
    serieRuntime = []
    temp = []

    # Loop through the list of top 50 best rated series.
    for item in dom('div.lister-item-content')[:TOP]:
    
        # Extract the title of every top rated serie and append it in the list serieTitle
        for serie in item.by_tag("h3.lister-item-header"):
            for title in serie.by_tag("a"):
                title = strip_tags(title)
                title = encode_utf8(title)
                serieTitle.append(title)

        # Extract the rating of every top rated serie and append it in the list serieRating
        for rating in item.by_tag('span.value'):
            rating = strip_tags(rating)
            rating = encode_utf8(rating)
            serieRating.append(rating)

        # Extract the genre of every top rated serie and append it in the list serieGenre
        for genre in item.by_tag("span.genre"):
            genre = strip_tags(genre)
            genre = encode_utf8(genre)
            serieGenre.append(genre.strip('\n').strip(' '))

        # Store every individual name in the list actors
        actors = []

        # Extract the stars of every top rated serie and append it in the list serieStars
        for actor in item.by_tag("p"):
            for name in actor.by_tag("a"):
                name = strip_tags(name)
                name = encode_utf8(name)
                actors.append(name)
        serieStars.append(actors)

        # Extract the runtime of every top rated serie and append it in the list serieRuntime
        for runtime in item.by_tag('span.runtime'):
            runtime = strip_tags(runtime)
            runtime = encode_utf8(runtime)
            serieRuntime.append(runtime.strip(' min'))

    '''
    Temporaraly extract every actor name from the i'th list in serieStars.
    Every serie lists four stars. Merge these four strings into one variable
    and append this to the temporary list.
    Re-assign the values of the temporary list to the serieStars list
    '''
    j = 0
    for i in range (TOP):
        a = serieStars[i][j]
        b = serieStars[i][j+1]
        c = serieStars[i][j+2]
        d = serieStars[i][j+3]
        e = "{}, {}, {}, {}". format(a, b, c, d)
        temp.append(e)
    serieStars = temp

    # Return the lists
    return serieTitle, serieRating, serieGenre, serieStars, serieRuntime


def save_csv(f, tvseries):
    '''
    This function will fill the csv with the output of extract_tvseries()
    '''

    writer = csv.writer(f)
    writer.writerow(['Row', 'Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # write 50 rows using the values we got in extract_tvseries()
    for i in range(TOP):
        writer.writerow((i+1, tvseries[0][i], tvseries[1][i], tvseries[2][i], tvseries[3][i], tvseries[4][i]))

def main():
    '''
    Main function will write to a csv-file called 'tvseries.csv' 
    '''

    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)

if __name__ == '__main__':
    main()