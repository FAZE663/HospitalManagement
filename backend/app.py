from flask import render_template,redirect,flash,url_for,session,Flask


app = Flask(__name__,template_folder='../frontend', static_folder='../frontend')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)