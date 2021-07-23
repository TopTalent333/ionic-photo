package mediachooser.async;

import android.content.Context;
import android.widget.ImageView;
import com.squareup.picasso.Picasso;
import com.synconset.FakeR;

import java.io.File;

public class ImageLoadAsync extends MediaAsync<String,String, String>{

	private ImageView mImageView;
	private Context mContext;
	private int mWidth;

	public ImageLoadAsync(Context context,ImageView imageView, int width) {
		mImageView = imageView;
		mContext   = context;
		mWidth     = width;
	}

	@Override
	protected String doInBackground(String... params) {
		String url = params[0].toString();
		return url;
	}

	@Override
	protected void onPostExecute(String result) {
		Picasso.with(mContext)
		.load(new File(result))
		.resize(mWidth, mWidth)
		.centerCrop().placeholder(getRDrawableId("ic_loading"))
		.into(mImageView);

	}


	public int getRDrawableId(String resourceId){
		return FakeR.getId(mContext, "drawable", resourceId);
	}

}
