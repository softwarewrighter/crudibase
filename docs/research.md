We could do a ReactJS CRUD app backed by an sqlite file database.  What problem domain?  What do you want the app to accomplish?   It could use "free" (rate-limited) APIs to provide some information.  Or, we could implement a register, login, logout, reset password workflow for a more secure app.  Harder: implement OAuth and use Google to log in.  We can explore Let's Encrypt or the alternative you mentioned to host the app at an https URL. 


If you don't have a problem to solve, we could do something with stocks, or we could look at other APIs to see what might be useful/entertaining.   I used to use a now defunct distributed database (like wikipedia but for data) called Metaweb, acquired and replaced by Google.  We can try using the replacement, wikibase, to get data for our CRUD app (it would basically cache some public data and maybe API keys etc.)


