package mediachooser.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;
import com.synconset.FakeR;
import mediachooser.BucketEntry;
import mediachooser.MediaChooserConstants;
import mediachooser.async.ImageLoadAsync;
import mediachooser.async.MediaAsync;

import java.util.ArrayList;

public class BucketGridAdapter extends ArrayAdapter<BucketEntry> {

//	public BucketVideoFragment bucketVideoFragment;

	private Context mContext;
	private ArrayList<BucketEntry> mBucketEntryList;
	private boolean mIsFromVideo;
	private int mWidth;
	LayoutInflater viewInflater;
	

	public BucketGridAdapter(Context context, int resource, ArrayList<BucketEntry> categories, boolean isFromVideo) {
		super(context, resource, categories);
		mBucketEntryList = categories;
		mContext         = context;
		mIsFromVideo     = isFromVideo;
		viewInflater = LayoutInflater.from(mContext);
	}

	public int getCount() {
		return mBucketEntryList.size();
	}

	@Override
	public BucketEntry getItem(int position) {
		return mBucketEntryList.get(position);
	}

	@Override
	public long getItemId(int position) {
		return position;
	}

	public void addLatestEntry(String url) {
		int count = mBucketEntryList.size();
		boolean success = false;
		for(int i = 0; i< count; i++){
			if(mBucketEntryList.get(i).bucketName.equals(MediaChooserConstants.folderName)){
				mBucketEntryList.get(i).bucketUrl = url;
				success = true;
				break;
			}
		}

		if(!success){
			BucketEntry latestBucketEntry = new BucketEntry(0, MediaChooserConstants.folderName, url);
			mBucketEntryList.add(0, latestBucketEntry);
		}
	}

	@Override
	public View getView(int position, View convertView, ViewGroup parent) {

		ViewHolder holder;

		if (convertView == null) {

			mWidth = mContext.getResources().getDisplayMetrics().widthPixels;  

			convertView  = viewInflater.inflate(getRLayoutId("view_grid_bucket_item_media_chooser"), parent, false);

			holder = new ViewHolder();
			holder.imageView    = (ImageView) convertView.findViewById(getRIntId("imageViewFromMediaChooserBucketRowView"));
			holder.nameTextView = (TextView) convertView.findViewById(getRIntId("nameTextViewFromMediaChooserBucketRowView"));

			convertView.setTag(holder);

		}else{
			holder = (ViewHolder) convertView.getTag();
		}

		FrameLayout.LayoutParams imageParams = (FrameLayout.LayoutParams) holder.imageView.getLayoutParams();
		imageParams.width  = mWidth/3;
		imageParams.height = mWidth/3;

		holder.imageView.setLayoutParams(imageParams);

		if(mIsFromVideo){
//			new VideoLoadAsync(bucketVideoFragment, holder.imageView, false, mWidth/2).executeOnExecutor(MediaAsync.THREAD_POOL_EXECUTOR, mBucketEntryList.get(position).bucketUrl.toString());

		}else{
			ImageLoadAsync loadAsync = new ImageLoadAsync(mContext, holder.imageView, mWidth/2);
			loadAsync.executeOnExecutor(MediaAsync.THREAD_POOL_EXECUTOR, mBucketEntryList.get(position).bucketUrl);
		}

		holder.nameTextView.setText(mBucketEntryList.get(position).bucketName );
		return convertView;
	}

	class ViewHolder {
		ImageView imageView;
		TextView nameTextView;
	}

	public int getRStringId(String resourceId){
		return FakeR.getId(mContext, "string", resourceId);
	}

	public int getRIntId(String resourceId){
		return FakeR.getId(mContext, "id", resourceId);
	}

	public int getRColorId(String resourceId){
		return FakeR.getId(mContext, "color", resourceId);
	}

	public int getRDrawableId(String resourceId){
		return FakeR.getId(mContext, "drawable", resourceId);
	}
	public int getRLayoutId(String resourceId){
		return FakeR.getId(mContext, "layout", resourceId);
	}

}


