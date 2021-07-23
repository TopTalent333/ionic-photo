package mediachooser;

public class MediaModel {

	public String url = null;
	public int orientation = 90;
	public boolean status = false;

	public MediaModel(String url, boolean status, int orientation) {
		this.url = url;
		this.status = status;
		this.orientation = orientation;
	}
}
