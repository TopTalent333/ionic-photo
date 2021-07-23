package mediachooser.fragment;

import android.content.Intent;
import android.database.Cursor;
import android.os.Bundle;
import android.provider.MediaStore;
import android.provider.MediaStore.Images.ImageColumns;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.GridView;
import android.widget.Toast;
import com.synconset.FakeR;
import com.synconset.MultiImageChooserActivity;
import mediachooser.BucketEntry;
import mediachooser.MediaChooserConstants;
import mediachooser.activity.HomeFragmentActivity;
import mediachooser.adapter.BucketGridAdapter;

import java.util.ArrayList;

public class BucketImageFragment extends Fragment{

	// The indices should match the following projections.
	private final int INDEX_BUCKET_ID     = 0;
	private final int INDEX_BUCKET_NAME   = 1;
	private final int INDEX_BUCKET_URL    = 2;

	private static final String[] PROJECTION_BUCKET = {
		ImageColumns.BUCKET_ID,
		ImageColumns.BUCKET_DISPLAY_NAME,
		ImageColumns.DATA};

	private View mView;
	private GridView mGridView;
	private BucketGridAdapter mBucketAdapter;

	private Cursor mCursor;



	public BucketImageFragment(){
		setRetainInstance(true);
	}

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		if(mView == null){
			mView     = inflater.inflate(getRLayoutId("view_grid_layout_media_chooser"), container, false);
			mGridView = (GridView)mView.findViewById(getRIntId("gridViewFromMediaChooser"));
			init();
		}else{
			((ViewGroup) mView.getParent()).removeView(mView);
			if(mBucketAdapter == null){
				Toast.makeText(getActivity(), getActivity().getString(getRStringId("no_media_file_available")), Toast.LENGTH_SHORT).show();
			}
		}
		return mView;
	}
	
	private void init() {
		Intent intent = getActivity().getIntent();
		final int maxImages = intent.getIntExtra(MultiImageChooserActivity.MAX_IMAGES_KEY, MultiImageChooserActivity.NOLIMIT);
		final int desiredWidth = intent.getIntExtra(MultiImageChooserActivity.WIDTH_KEY, 0);
		final int desiredHeight = intent.getIntExtra(MultiImageChooserActivity.HEIGHT_KEY, 0);
		final int quality = intent.getIntExtra(MultiImageChooserActivity.QUALITY_KEY, 0);
		final int thumbSize = intent.getIntExtra(MultiImageChooserActivity.THUMB_SIZE_KEY, 0);

		final String orderBy = MediaStore.Images.Media.DATE_TAKEN;
		mCursor = getActivity().getContentResolver().query(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, PROJECTION_BUCKET, null, null, orderBy + " DESC");
		ArrayList<BucketEntry> buffer = new ArrayList<BucketEntry>();
		try {
			while (mCursor.moveToNext()) {
				BucketEntry entry = new BucketEntry(
						mCursor.getInt(INDEX_BUCKET_ID),
						mCursor.getString(INDEX_BUCKET_NAME), mCursor.getString(INDEX_BUCKET_URL));

				if (!buffer.contains(entry)) {
					buffer.add(entry);
				}
			}

			if (mCursor.getCount() > 0) {
				mBucketAdapter = new BucketGridAdapter(getActivity(), 0, buffer, false);
				mGridView.setAdapter(mBucketAdapter);
			} else {
				Toast.makeText(getActivity(), getActivity().getString(getRStringId("no_media_file_available")), Toast.LENGTH_SHORT).show();
			}

			mGridView.setOnItemClickListener(new OnItemClickListener() {

				@Override
				public void onItemClick(AdapterView<?> adapter, View view, int position, long id) {

					BucketEntry bucketEntry = (BucketEntry) adapter.getItemAtPosition(position);
					Intent selectImageIntent = new Intent(getActivity(), HomeFragmentActivity.class);
					selectImageIntent.putExtra("name", bucketEntry.bucketName);
					selectImageIntent.putExtra("image", true);
					selectImageIntent.putExtra("isFromBucket", true);

					selectImageIntent.putExtra(MultiImageChooserActivity.MAX_IMAGES_KEY, maxImages);
					selectImageIntent.putExtra(MultiImageChooserActivity.WIDTH_KEY, desiredWidth);
					selectImageIntent.putExtra(MultiImageChooserActivity.HEIGHT_KEY, desiredHeight);
					selectImageIntent.putExtra(MultiImageChooserActivity.QUALITY_KEY, quality);
					selectImageIntent.putExtra(MultiImageChooserActivity.THUMB_SIZE_KEY, thumbSize);

					getActivity().startActivityForResult(selectImageIntent, MediaChooserConstants.BUCKET_SELECT_IMAGE_CODE);
				}
			});

		} finally {
			mCursor.close();
		}
	}

	public BucketGridAdapter getAdapter() {
		return	mBucketAdapter;
	}


	public int getRStringId(String resourceId){
		return FakeR.getId(getActivity(), "string", resourceId);
	}

	public int getRIntId(String resourceId){
		return FakeR.getId(getActivity(), "id", resourceId);
	}

	public int getRColorId(String resourceId){
		return FakeR.getId(getActivity(), "color", resourceId);
	}

	public int getRDrawableId(String resourceId){
		return FakeR.getId(getActivity(), "drawable", resourceId);
	}
	public int getRLayoutId(String resourceId){
		return FakeR.getId(getActivity(), "layout", resourceId);
	}


}
